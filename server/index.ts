import express from 'express';
import * as path from 'path';
import { json } from 'body-parser';

const port = process.env.PORT || 3000;

const app = express();
app.use(json());

const publicPath = path.join(__dirname, '..', '..', '..', 'build');

app.use(express.static(publicPath));

app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on PORT:${port}`);
});
