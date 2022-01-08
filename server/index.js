const express = require('express');
const path = require('path')
const bodyParser = require('body-parser')
import {quoteRouter} from "./api/customer-quote";
const port = process.env.COM_PORT || 5000;

const app = express();
app.use(bodyParser.json());

const publicPath = path.join(__dirname, '..', 'build');

app.use(express.static(publicPath));

app.use('/api/quote', quoteRouter);
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on PORT:${port}`);
});
