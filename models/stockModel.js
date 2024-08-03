const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
    symbol: { type: String, required: true },
    curr_value: { type: Number, required: true },
    max_value: { type: Number, required: true },
    min_value: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
  });
module.exports = mongoose.model('Stock', StockSchema);
