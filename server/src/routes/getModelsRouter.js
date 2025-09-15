const express = require('express');
const getModels = require('../controllers/getModelsController');

const getModelsRouter = express.Router();

getModelsRouter.get('/', getModels);

module.exports = getModelsRouter;
