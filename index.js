var express = require('express')
var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var port = process.env.PORT || 5000
var _ = require('lodash')
var request = require('request')
var moment = require('moment')
var MongoClient = require('mongodb').MongoClient
var assert = require('assert')
var ObjectID = require('mongodb').ObjectID
var Chance = require('chance')
var chance = new Chance()

/** GDAX */
var Gdax = require('gdax')

app.use(express.static(__dirname + '/public'))
// views is directory for all template files
app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')
app.get('/', function(request, response) {
  response.render('pages/index')
})

/** Helper functions */
function toFixed(_number, _scale) {
  var n = _.toNumber(_number)
  return n.toFixed(_scale)
}

/** Data object used for monitoring sent to client for viewing */
var data = {
  btc: {
    orderbook: {
      asks: [],
      bids: []
    }
  },
  eth: {
    orderbook: {
      asks: [],
      bids: []
    }
  },
  xch: {
    orderbook: {
      asks: [],
      bids: []
    }
  },
  calcs: []
}

var bookLength = 11
var count = 1
var r_count = 1
var ___current_eth_ask___
var ETH = new Gdax.PublicClient('ETH-USD')
var XCH = new Gdax.PublicClient('ETH-BTC')
var BTC = new Gdax.PublicClient('BTC-USD')

/** REQUIRED */
/** Secure authorized client requirements set up on https://www.gdax.com/settings/api */
const passphrase = '<your_passphrase>'
const key = '<your_api_key>'
const b64secret = '<your_secret_key>'
const apiURI = 'https://api.gdax.com'

/** Secure MongoDB url - Optional */
const MongoDB_URL = '<your_mongo_db_secure_url>'

const authedClient = new Gdax.AuthenticatedClient(key, b64secret, passphrase, apiURI)

var __buyExecuted__ETH_USD = false
var __orderSettled__ETH_USD = false
var __tradeExecuted__ETH_BTC = false
var __orderSettled__ETH_BTC = false
var __sellExecuted__BTC_USD = false
var __orderSettled__BTC_USD = false

function __checkOrder__BTC_USD(__order_id) {
  var checkOrder = setInterval(function() {
    authedClient.getOrder(__order_id, function(__order_err, __order_resp, __order) {
      if (__order.settled) {
        clearInterval(checkOrder)
        __orderSettled__BTC_USD = true
      }
    })
  }, 1000)
}

function __executeSell__BTC_USD(__btc_price) {
  authedClient.getAccounts(function(__btc_funds_err, __btc_funds_resp, __btc_funds_body) {
    var num = _.find(__btc_funds_body, {
      id: '<your_gdax_btc_id>'
    }).available
    var __btc_guid = chance.guid()
    var btc_available = num.match(/^-?\d+(?:\.\d{0,8})?/)[0]
    _sell_BTC_USD(__btc_price, btc_available, __btc_guid, function(__sell_btc_body) {
      if (__sell_btc_body.status === 'rejected') {
        console.log('__sell_btc_body REJECTED: ', __sell_btc_body.reject_reason);
      } else if (!__sell_btc_body.status) {
        console.log('__executeSell__BTC_USD MESSAGE', __sell_btc_body.message);
      } else {
        console.log('__executeSell__BTC_USD STATUS', __sell_btc_body.status);
        __sellExecuted__BTC_USD = true
        __checkOrder__BTC_USD(__sell_btc_body.id)
      }
    })
  })
}

function __checkOrder__ETH_BTC(__order_id) {
  var checkOrder = setInterval(function() {
    authedClient.getOrder(__order_id, function(__order_err, __order_resp, __order) {
      if (__order.settled) {
        clearInterval(checkOrder)
        __orderSettled__ETH_BTC = true
      } else {
        console.log('__checkOrder__ETH_BTC status', __order.status);
        if (toFixed(_.subtract(___current_eth_ask___, __eth_ask_price), 2) >= 5) {
          authedClient.cancelOrder(__order_id, function(cancel_err, cancel_resp, cancel_body) {
            var __sell = {
              'client_oid': chance.guid(),
              'price': ___current_eth_ask___,
              'size': __order.size,
              'product_id': 'ETC-USD',
              'side': 'sell',
              'stp': 'dc',
              'type': 'limit',
              'time_in_force': 'GTC',
              'post_only': false
            }
            authedClient.sell(__sell, function(sell_err, sell_resp, sell_body) {
              console.log('ETH_BTC order closed and sold for profit', sell_body);
              __go_rBitrage(true)
            })
          });
        }
      }
    })
  }, 1000)
}

function __executeTrade__ETH_BTC(__trade_price) {
  authedClient.getAccounts(function(__eth_funding_err, __eth_funding_resp, __eth_funding_body) {
    var eth_available = toFixed(_.find(__eth_funding_body, {
      id: '<your_gdax_eth_id>'
    }).available, 9)
    var __trade_guid = chance.guid()
    _trade_ETH_BTC(__trade_price, eth_available, __trade_guid, function(__trade_body) {
      if (__trade_body.status === 'rejected') {
        console.log('__trade_body REJECTED', __trade_body.reject_reason)
      } else if (!__trade_body.status) {
        console.log('__trade_body.message', __trade_body.message);
        if (__trade_body.message === 'Insufficient funds') {
          console.log('eth_available', eth_available);
        }
      } else {
        console.log('__trade_body PENDING', __trade_body.status)
        __tradeExecuted__ETH_BTC = true
        __checkOrder__ETH_BTC(__trade_body.id)
      }
    })
  })
}

function __checkOrder__ETH_USD(__order_id) {
  var checkOrder = setInterval(function() {
    authedClient.getOrder(__order_id, function(__order_err, __order_resp, __order) {
      if (__order.settled) {
        clearInterval(checkOrder)
        console.log('__checkOrder__ETH_USD settled', __order.settled);
        __orderSettled__ETH_USD = true
      } else {
        console.log('__checkOrder__ETH_USD status', __order.status);
      }
    })
  }, 1000)
}

function __executeBuy__ETH_USD(__eth_price) {
  authedClient.getAccounts(function(auth_acct_err, auth_acct_resp, auth_acct_body) {
    var usd_available = toFixed(_.find(auth_acct_body, {
      id: '<your_gdax_usd_id>'
    }).available, 2)
    if (usd_available >= 500) {
      var __size = toFixed(_.divide((usd_available - 1), __eth_price), 7)
      var __eth_guid = chance.guid()
      _buy__ETH_USD(toFixed(__eth_price, 2), __size, __eth_guid, function(__buy_eth_body) {
        if (__buy_eth_body.status === 'rejected') {
          console.log('__buy_eth_body REJECTED', __buy_eth_body.reject_reason)
        } else if (!__buy_eth_body.status) {
          console.log('__buy_eth_body MESSAGE', __buy_eth_body.message)
        } else {
          console.log('__buy_eth_body EXECUTED', __buy_eth_body.status)
          __buyExecuted__ETH_USD = true
          __checkOrder__ETH_USD(__buy_eth_body.id)
        }
      })
    } else {
      console.log('Min Acct Balance Reached: ', usd_available)
    }
  })
}

function _buy__ETH_USD(__price, __size, __guid, __callback) {
  var __buy_eth_params = {
    'client_oid': __guid,
    'price': __price,
    'size': __size,
    'product_id': 'ETH-USD',
    'side': 'buy',
    'stp': 'dc',
    'type': 'limit',
    'time_in_force': 'GTC',
    'post_only': true
  }
  return authedClient.buy(__buy_eth_params, function(buy_eth_err, buy_eth_resp, buy_eth_body) {
    __callback(buy_eth_body)
    return buy_eth_body
  })
}

function _trade_ETH_BTC(__price, __size, __guid, __callback) {
  var __trade = {
    'client_oid': __guid,
    'price': __price,
    'size': __size,
    'product_id': 'ETH-BTC',
    'side': 'sell',
    'stp': 'dc',
    'type': 'limit',
    'time_in_force': 'GTC',
    'post_only': true
  }
  return authedClient.sell(__trade, function(trade_err, trade_resp, trade_body) {
    __callback(trade_body)
    return trade_body
  })
}

function _sell_BTC_USD(__price, __size, __guid, __callback) {
  var __sell_btc_params = {
    'client_oid': __guid,
    'price': __price,
    'size': __size,
    'product_id': 'BTC-USD',
    'side': 'sell',
    'stp': 'dc',
    'type': 'limit',
    'time_in_force': 'GTC',
    'post_only': true
  }
  return authedClient.sell(__sell_btc_params, function(sell_err, sell_resp, sell_body) {
    __callback(sell_body)
    return sell_body
  })
}

var __eth_ask_price
var __xch_bid_price
var __btc_bid_price

io.on('connection', function(socket) {
  socket.on('get market data', function(msg) {
    /** ETH - Orderbook */
    ETH.getProductOrderBook({
      level: 2
    }, function(err, response, body) {
      if (!body || !body.asks || !body.asks[0]) {
        console.log('error', err);
      } else {
        data.eth.orderbook.asks = []
        data.eth.orderbook.bids = []
        for (var a = 0; a < bookLength; a++) {
          data.eth.orderbook.asks.push({
            price: body.asks[a][0],
            amount: body.asks[a][1]
          })
        }
        for (var b = 0; b < bookLength; b++) {
          data.eth.orderbook.bids.push({
            price: body.bids[b][0],
            amount: body.bids[b][1]
          })
        }
      }
    })
    /** XCH (ETH_BTC) - Orderbook */
    XCH.getProductOrderBook({
      level: 2
    }, function(err, response, body) {
      if (!body || !body.asks || !body.asks[0]) {
        console.log('error', err);
      } else {
        data.xch.orderbook.asks = []
        data.xch.orderbook.bids = []
        for (var a = 0; a < bookLength; a++) {
          data.xch.orderbook.asks.push({
            price: body.asks[a][0],
            amount: body.asks[a][1]
          })
        }
        for (var b = 0; b < bookLength; b++) {
          data.xch.orderbook.bids.push({
            price: body.bids[b][0],
            amount: body.bids[b][1]
          })
        }
      }
    })
    /** BTC - Orderbook */
    BTC.getProductOrderBook({
      level: 2
    }, function(err, response, body) {
      if (!body || !body.asks || !body.asks[0]) {
        console.log('error', err);
      } else {
        for (var a = 0; a < bookLength; a++) {
          data.btc.orderbook.asks = []
          data.btc.orderbook.bids = []
          data.btc.orderbook.asks.push({
            price: body.asks[a][0],
            amount: body.asks[a][1]
          })
        }
        for (var b = 0; b < bookLength; b++) {
          data.btc.orderbook.bids.push({
            price: body.bids[b][0],
            amount: body.bids[b][1]
          })
        }
      }
    })
    data.date_time = moment().format('MMM DD, h:mm:ss a')
    data.count = count
    if (data.btc.orderbook.asks.length > 0 && data.eth.orderbook.asks.length > 0 && data.xch.orderbook.asks.length > 0) {
      data.calcs = []
      var eth_asks = data.eth.orderbook.asks
      var xch_bids = data.xch.orderbook.bids
      var xch_asks = data.xch.orderbook.asks
      var btc_bids = data.btc.orderbook.bids
      for (var i = 0; i < 11; i++) {
        if (!xch_bids || !xch_bids[i]) {
          return
        }
        var eth_coins = 3
        var eth_asks_available = eth_asks[i].amount
        var eth_ask_price = eth_asks[i].price
        var buy_subtotal = _.multiply(eth_ask_price, eth_coins)
        var buy_fees = _.multiply(buy_subtotal, .0000)
        var buy_total_invest = _.add(buy_subtotal, buy_fees) /** Invest = Subtotal plus fees */
        var xch_bids_available = xch_bids[i].amount
        var xch_bid_price = xch_bids[i].price
        var xch_ask_price = xch_asks[i].price
        var xch_subtotal = _.multiply(xch_bid_price, eth_coins)
        var xch_fees = _.multiply(xch_subtotal, .0000)
        var btc_coins = _.subtract(xch_subtotal, xch_fees)
        var btc_bids_available = btc_bids[i].amount
        var btc_bid_price = btc_bids[i].price
        var sell_subtotal = _.multiply(btc_bid_price, btc_coins)
        var sell_fees = _.multiply(sell_subtotal, .0000)
        var sell_total_return = _.subtract(sell_subtotal, sell_fees) /** Return = Subtotal minus fees */
        var net_gain = _.subtract(sell_total_return, buy_total_invest)
        var obj = {
          date_time: data.date_time,
          source: 'Dev',
          eth_coins: toFixed(eth_coins, 4),
          eth_asks_available: toFixed(eth_asks_available, 4),
          eth_ask_price: toFixed(eth_ask_price, 2),
          buy_total_invest: toFixed(buy_total_invest, 2),
          xch_bids_available: toFixed(xch_bids_available, 4),
          xch_bid_price: toFixed(xch_bid_price, 5),
          xch_ask_price: toFixed(xch_ask_price, 5),
          btc_bids_available: toFixed(btc_bids_available, 4),
          btc_coins: toFixed(btc_coins, 4),
          btc_bid_price: toFixed(btc_bid_price, 2),
          sell_total_return: toFixed(sell_total_return, 2),
          net_gain: toFixed(net_gain, 2)
        }
        data.calcs.push(obj)
      }
      var rbitrage = data.calcs[0]
      ___current_eth_ask___ = rbitrage.eth_ask_price
      // if (rbitrage.net_gain >= 3) {
      if (r_count <= 3) {
        console.log('set prices');
        __eth_ask_price = toFixed(_.subtract(_.toNumber(rbitrage.eth_ask_price), 0.01), 2)
        __xch_bid_price = toFixed(_.add(_.toNumber(rbitrage.xch_bid_price), 0.00001), 5)
        __btc_bid_price = toFixed(_.add(_.toNumber(rbitrage.btc_bid_price), 2.01), 2)
        console.log('__eth_ask_price', __eth_ask_price);
        console.log('__xch_bid_price', __xch_bid_price);
        console.log('__btc_bid_price', __btc_bid_price);
        r_count++
        __go_rBitrage(false)
      }
      // }
      /** Send data to client. */
      io.emit('get market data', data)
      count++
    }
  })
})

function __go_rBitrage(__stop) {
  var interval = setInterval(function() {
    if (__stop) {
      clearInterval(interval)
    }
    if (!__buyExecuted__ETH_USD) {
      console.log('__eth_ask_price', __eth_ask_price);
      __executeBuy__ETH_USD(__eth_ask_price)
    }
    if (__orderSettled__ETH_USD && !__tradeExecuted__ETH_BTC) {
      console.log('__xch_bid_price', __xch_bid_price);
      __executeTrade__ETH_BTC(__xch_bid_price)
    }
    if (__orderSettled__ETH_BTC && !__sellExecuted__BTC_USD) {
      console.log('__btc_bid_price', __btc_bid_price);
      __executeSell__BTC_USD(__btc_bid_price)
    }
    if (__orderSettled__BTC_USD) {
      console.log('trade complete');
      __buyExecuted__ETH_USD = false
      __orderSettled__ETH_USD = false
      __tradeExecuted__ETH_BTC = false
      __orderSettled__ETH_BTC = false
      __sellExecuted__BTC_USD = false
      __orderSettled__BTC_USD = false
      r_count = 0
      clearInterval(interval)
    }
  }, 1000)
}

/** MongoDB Functions - Optional */
function sendToMongo(__data, __collection) {
  /** Send to Mongo DB */
  var insertDocument = function (db, __obj, callback) {
    // Create a new ObjectID
    var objectId = new ObjectID()
    db.collection(__collection).insertOne(__obj, function (err, result) {
      assert.equal(24, objectId.toHexString().length)
      assert.equal(err, null)
      console.log('Inserted a document into ' + __collection)
      callback()
    })

  }
  MongoClient.connect(MongoDB_URL, function (err, db) {
    assert.equal(null, err)
    insertDocument(db, __data.calcs[0], function () {
      getOpportunitiesHistory()
    })
  })
}
var __obj = {
  date_time: 1,
  eth_coins: 1,
  eth_ask_price: 1,
  buy_total_invest: 1,
  xch_amount: 1,
  xch_bid_price: 1,
  btc_amount: 1,
  btc_coins: 1,
  btc_bid_price: 1,
  sell_total_return: 1,
  net_gain: 1
}

var db_collection = '<your_db_collection>'
var rbitrage_threshold = 1

function getOpportunitiesHistory() {
  var __sumArray = []
  var __sum = MongoClient.connect(MongoDB_URL, function(err, db) {
    assert.equal(null, err)
    db.collection(db_collection).find({}, {
      skip: 1,
      limit: 8000,
      fields: __obj
    }).toArray(function(err, docs) {
      _.each(docs, function(obj) {
        if (obj.net_gain >= rbitrage_threshold) {
          __sumArray.push(_.toNumber(obj.net_gain))
        }
      })
      var latestDate = _.last(docs).date_time
      var firstDate = _.first(docs).date_time
      var latest = moment(latestDate, 'MMM DD, h:mm:ss a').toDate()
      var first = moment(firstDate, 'MMM DD, h:mm:ss a').toDate()
      var date1 = moment(first)
      var date2 = moment(latest)
      var diff = date2.diff(date1, 'minutes')
      var hours = _.divide(diff, 60)
      // __sum = toFixed(_.multiply(_.sum(__sumArray), 0.40), 2)
      __sum = toFixed(_.sum(__sumArray), 2)
      var __avg = toFixed(_.divide(__sum, hours), 2)
      console.log('----------------------------')
      console.log('rbitrage_threshold: $', rbitrage_threshold)
      console.log(db_collection)
      console.log('start: ', firstDate)
      console.log('__end: ', latestDate)
      console.log('__hrs: ', toFixed(hours, 2))
      console.log('trades: ', __sumArray.length)
      console.log('----------------------------')
      console.log('sum: $', __sum)
      console.log('avg / hr: $', __avg)
      console.log('============================')
      db.close()
    })
  })
}

getOpportunitiesHistory()

http.listen(port, function() {
  console.log('listening on *:' + port)
})