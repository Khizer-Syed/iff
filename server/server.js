const express = require('express');
const path = require('path')
const bodyParser = require('body-parser')
const quoteRouter = require('./api/customer-quote');
const port = process.env.COM_PORT || 5000;

const app = express();
app.use(bodyParser.json());

app.use(express.static(path.resolve(__dirname, '../client'), { index: false }));

app.use('/api/quote', quoteRouter);
app.get('*', (req, res) => {
    console.log(path.resolve(__dirname, '../client/index.html'));
    res.sendFile(path.resolve(__dirname, '../client/index.html'));
});

app.listen(port, () => {
    console.log(`Server running on PORT:${port}`);
});
