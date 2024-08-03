const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const connectDB = require('./db')
const {getStockData, fetchLatestStocks} = require('./services/stockService')
const cron = require('node-cron');
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });
const symbols = require('./configs/app.json').SYMBOLS;
const Stock = require('./models/stockModel');
const mockData = require('./configs/mockData.json')
const cors = require('cors');
connectDB();

cron.schedule('*/20 * * * * *', async () => {
    console.log('Fetching stock data...');
    for(let i=0;i<symbols.length;i++){
        let symbol = symbols[i];
        let stockData = await getStockData(symbol);
        let updStockData = new Stock ({
            symbol ,
            curr_value : stockData.c,
            max_value : stockData.h,
            min_value : stockData.l,
            timestamp: stockData.t
        })
        await updStockData.save();
    }
});
app.use(cors({
    origin: 'http://localhost:3000', // Replace with the origin you want to allow
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
  }));

app.get('/symbols', (req,res) => {
    try{
       res.status(200).json(symbols);
    }
    catch(err){
         res.status(500).send({message : "Internal Server error"});
    }
})

wss.on('connection', ws => {
    console.log('Client connected');
    ws.on('close', () => console.log('Client disconnected'));
    const sendLatestStocks = async () => {
        const latestStocks = await fetchLatestStocks(symbols);
        ws.send(JSON.stringify(latestStocks));
    };
    const sendManualStockData = ()=> {
        ws.send(JSON.stringify(mockData)); 
    }
    const intervalId = setInterval(sendLatestStocks, 9000);
    ws.on('close', () => {
        clearInterval(intervalId)
    });
})
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
