const Stock = require('../models/stockModel');
const axios = require('axios');
const FINHUB_QUOTE_URI = require('../configs/app.json').FINHUB_QUOTE_URI;
const FINHUB_TOKEN = require('../configs/app.json').FINHUB_TOKEN;

const getStockData = async (symbol) => {
    try {
        const response = await axios.get(FINHUB_QUOTE_URI + `?symbol=${symbol}&token=${FINHUB_TOKEN}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching stock data:', error);
        throw (error);
    }
};
const fetchLatestStocks = async (symbols) => {
    try {
        const latestStocks = {};
        for (const symbol of symbols) {
            const stocks = await Stock.find({ symbol })
                .sort({ timestamp: -1 })
                .limit(20);
            latestStocks[symbol] = stocks.map((stock) => {
                return {
                    symbol: stock.symbol,
                    curr_value: stock.curr_value,
                    max_value: stock.max_value,
                    min_value: stock.min_value,
                    timestamp: stock.timestamp
                }
            });
        }
        return latestStocks;
    }
    catch (err) {
        console.error('Error fetching latest stocks:', error);
        throw (err);
    }
}
module.exports = {
    getStockData,
    fetchLatestStocks,
};