# rBitrage.io
A Node Express app built using the Heroku CLI for monitoring arbitrage opportunities and auto trading within a single crypto currency exchange and between different exchanges.

[![Node](https://www.shareicon.net/data/128x128/2015/10/06/112725_development_512x512.png)](https://nodejs.org/en/)

# Current Status & Features!
  - Status: Aug 8, 2017 - 90% Code completion
  - GDAX automated internal monitoring and trading of USD to ETH to BTC to USD
  - GDAX Account required through Coinbase
  - GDAX API Key, Secret Key and Passphrase

# Planned Features!
  - Automated internal monitoring and trading of USD to ETH to BTC to USD on:
      - Gemini
      - Kraken
      - Bitfinex
      - Bitrex
  - Automated watch function and arbitrage trading of BTC to BTC between exchanges.
  - Automated watch function and arbitrage trading of ETH to ETH between exchanges.

> Arbitrage is the simultaneous purchase and sale of an asset to profit from a difference in the price.
> It is a trade that profits by capitalizing on the price differences of identical commodities
> on different exchanges

This text you see here is *actually* written in Markdown! To get a feel for Markdown's syntax, type some text into the left window and watch the results in the right.

### Tech

rBitrage.io uses a number of open source projects to work properly:

* [node.js] - evented I/O for the backend
* [Express] - fast node.js network app framework [@tjholowaychuk]
* [jQuery] - Client side data binding and event handling

##### rBitrage itself is NOT open source and is on a [private repository] on GitHub  --  Please do  not share with anyone.


### Installation

This application supports the [Getting Started with Node on Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs) article - check it out.

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku CLI](https://cli.heroku.com/) installed.

```sh
$ git clone git@github.com:flavioespinoza/rBitrage.io.git
$ cd rbitrage
$ npm install
$ npm start
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

## Deploying to Heroku

```
$ heroku create
$ git push heroku master
$ heroku open
```
or

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Documentation

For more information about using Node.js on Heroku, see these Dev Center articles:

- [Getting Started with Node.js on Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Heroku Node.js Support](https://devcenter.heroku.com/articles/nodejs-support)
- [Node.js on Heroku](https://devcenter.heroku.com/categories/nodejs)
- [Best Practices for Node.js Development](https://devcenter.heroku.com/articles/node-best-practices)
- [Using WebSockets on Heroku with Node.js](https://devcenter.heroku.com/articles/node-websockets)


   [node.js]: <http://nodejs.org>
   [jQuery]: <http://jquery.com>
   [express]: <http://expressjs.com>
