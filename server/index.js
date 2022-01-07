const express = require('express');
const path = require('path')
const bodyParser = require('body-parser')

const port = process.env.PORT || 5000;

const app = express();
app.use(bodyParser.json());

const publicPath = path.join(__dirname, '..', 'build');

app.use(express.static(publicPath));

app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on PORT:${port}`);
});
