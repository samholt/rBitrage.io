/**
 * Created by Flavor on 8/4/17.
 */
var socket = io()

$('#calcsHeader').append('' +
  '<div class="mdl-list__item">' +
  '<span class="mdl-list__item-primary-content">ETH Coins</span>' +
  '<span class="mdl-list__item-primary-content">Total Investment</span>' +
  '<span class="mdl-list__item-primary-content">XCH Bid</span>' +
  '<span class="mdl-list__item-primary-content">BTC Coins</span>' +
  '<span class="mdl-list__item-primary-content">Total Return</span>' +
  '<span class="mdl-list__item-primary-content">P/L</span>' + '' +
  '</div>')

$(function() {
  
  setInterval(function() {
    socket.emit('get market data', 'go')
    return false
  }, 1000)

  socket.on('get market data', function(data) {
    
    /** Current time and date. */
    $('#date_time').html(data.date_time)
    $('#count').html(data.count)

    /** Clear orderbook asks */
    $('#calcs').html('')
    
    for (var i = 0; i < 11; i++) {
      $('#calcs').append('' +
        '<div class="mdl-list__item">' +
          '<span class="mdl-list__item-primary-content">' + data.calcs[i].eth_coins + '</span>' +
          '<span class="mdl-list__item-primary-content">' + data.calcs[i].buy_total_invest + '</span>' +
          '<span class="mdl-list__item-primary-content">' + data.calcs[i].xch_bid_price + '</span>' +
          '<span class="mdl-list__item-primary-content">' + data.calcs[i].btc_coins + '</span>' +
          '<span class="mdl-list__item-primary-content">' + data.calcs[i].sell_total_return + '</span>' +
          '<span class="mdl-list__item-primary-content">' + data.calcs[i].net_gain + '</span>' + '' +
        '</div>')
    }
    
  })
  
})