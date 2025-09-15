const express = require('express');
const getFineTuneModel = require('../controllers/getFineTuneModelController');

const getFineTuneRouter = express.Router();

getFineTuneRouter.get('/:jobId', getFineTuneModel);

module.exports = getFineTuneRouter;
