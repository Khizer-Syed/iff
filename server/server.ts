import express from 'express';
import {quotesRouter} from './api/quotes';
import bodyParser from 'body-parser';
import path from 'path';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
    const server = express();
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));
    server.use(express.static(path.resolve(__dirname, '../ui'), { index: false }));

    server.use('/api/quotes', quotesRouter);

    // All regular routes use the Universal engine
    server.get('*', (req, res) => {
         res.sendFile(path.resolve(__dirname, '../ui/index.html'));
    });

    return server;
}

function run(): void {
    const port = process.env.IFFCARGO_PORT || 5000;

    // Start up the Node server
    const server = app();
    server.listen(port, () => {
        console.log(`Node Express server listening on http://localhost:${port}`);
    });
}

run();
