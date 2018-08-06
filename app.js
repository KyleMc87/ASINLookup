const bodyparser = require('body-parser');
const curl = require('curl');
const express = require('express');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const mongoose = require('mongoose');
const path = require('path');
const product = require('./models/product');
const session = require('express-session');

const app = express();

// In real life this would be a pretty darn brutal way to do this, allowing arbitrary script 
// execution on the server, but in absence of an API for this example I think it'll do
const options = {
  referrer: 'https://www.amazon.ca/',
  runScripts: 'dangerously',
  includeNodeLocations: true,
};

const errors = {
  dne: { error: 'This ASIN does not exist, please check your spelling.' },
  internal: { error: 'An internal error occurred'},
};

mongoose.connect('mongodb://localhost:27017/amzfind');

app.use(express.static(__dirname + '/assets'));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(session({
  secret: 'juno is the best dog',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/item/:id', (req, res) => {
  let collection = {};
  const asin = req.params.id;

  collection = product.find({ asin: asin }, (err, found) => {
    if (err) {
      res.json(errors.dne);
    } else {
      if (found.length) {
        res.json(found[0]);
      } else {
        JSDOM.fromURL(`https://www.amazon.ca/dp/${asin}`, options).then(dom => {
          const newProduct = scrapeProduct(dom);
          insertProduct(newProduct, res);
        }).catch(() => {
          res.json(errors.dne);
        });
      }
    }
  });
});

function scrapeProduct(dom) {
  let categories = [];
  dom.window.document.querySelectorAll('#wayfinding-breadcrumbs_feature_div a').forEach(node => { 
    categories.push(node.textContent.replace(/ +(?= )/g, '')); 
  });
  const dimensions = dom.window.document.querySelectorAll('.pdTab table tbody tr.size-weight td.value')[1].textContent;
  const weight = dom.window.document.querySelectorAll('.pdTab table tbody tr.size-weight td.value')[0].textContent;
  const ranks = dom.window.document
    .querySelectorAll('.section.techD .pdTab #SalesRank td.value')[0]
    .textContent
    .replace(/\n+/g, '');
  return { categories: categories, asin: asin, details: {
      dimensions: dimensions,
      weight: weight,
    },
    seller: {
      ranks: ranks
    },
  };
}

function insertProduct(newProduct, res) {
  product.create(newProduct, (err, created) => {
    if (err) {
      res.json(errors.internal);
    } else {
      res.json(created);
    }
  })
}

app.listen('8080', 'localhost', () => {
  console.log('Listening on http://localhost:8080');
});