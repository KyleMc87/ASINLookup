const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  asin: String,
  categories: Array,
  details: {
    dimensions: String,
    weight: String,
  },
  seller: {
    ranks: String
  },
});

const product = mongoose.model('product', productSchema);

module.exports = product;