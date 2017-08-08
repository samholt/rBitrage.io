# rBitrage.io
A Node Express app built using the Heroku CLI for monitoring arbitrage opportunities and auto trading within a single crypto currency exchange and between different exchanges.

[![Node](https://www.shareicon.net/data/128x128/2015/10/06/112725_development_512x512.png)](https://nodejs.org/en/)

> Arbitrage is the simultaneous purchase and sale of an asset to profit from a difference in the price.
> It is a trade that profits by capitalizing on the price differences of identical/similar commodities
> on the same exchange or different exchanges.

# Current Status & Features!
  - Status: Aug 8, 2017 - 90% Code completion of internal monitor and auto trader.
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

### Tech

rBitrage.io uses a number of open source projects to work properly:

* [node.js](https://nodejs.org) - Evented I/O for the backend
* [Express](https://expressjs.com/) - Fast node.js network app framework
* [Socket.io](http://socket.io/) - Real-time bidirectional event-based communication
* [jQuery](https://jquery.com/) - Client side data binding and event handling
* [EdgeCSS](https://github.com/flavioespinoza/edge-css) - Intuitive classes for quick markup styling
* [Material Design Lite](https://getmdl.io/) - Non JS reliant Material Design web components
* [D3](https://d3js.org) - Dynamic interactive data visualizations
* [Moment](https://momentjs.com/) - Parse, validate, and display dates and times in JavaScript
* [Lodash](https://lodash.com/) - Utility functions for complex array and object manipulations
* [MongoDB](https://www.mongodb.com/) - NoSQL cross-platform document-oriented database

### Installation

This application supports the [Getting Started with Node on Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs) article - check it out.

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku CLI](https://cli.heroku.com/) installed.

```sh
$ git clone git@github.com:flavioespinoza/rBitrage.io.git
$ cd rBitrage.io //or your prefferd directory
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

