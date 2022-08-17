const express = require('express');
const Router = require('./src/Router.js');
const cors = require('cors');
const server = express();
require('dotenv').config();

server.use(cors());
server.use(express.json());
server.use('/api/', Router);


// Start server
const port = process.env.PORT || 5000;

server.listen(port, () => console.log(`Server started on port ${port}`));