'use strict';

const express = require('express');

// Constants
const PORT = process.env.PORT;
const HOST = process.env.HOST;

// App
const app = express();

app.get('/', (req, res) => {
    return res.send('Get HTTP Method');
});

app.post('/', (req, res) => {
    return res.send('Post HTTP Method');
})

app.put('/', (req, res) => {
    return res.send('Put HTTP Method');
})

app.delete('/', (req, res) => {
    return res.send('Delete HTTP Method');
})

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);