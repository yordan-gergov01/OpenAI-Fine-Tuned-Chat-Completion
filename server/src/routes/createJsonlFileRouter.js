const express = require('express');
const createJsonl = require('../controllers/createJsonlController');

const createJsonlRouter = express.Router();

createJsonlRouter.post('/', createJsonl);

module.exports = createJsonlRouter;
