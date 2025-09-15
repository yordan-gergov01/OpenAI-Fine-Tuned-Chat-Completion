const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./middlewares/errorHandler');

const createJsonlRouter = require('./routes/createJsonlFileRouter');
const getFineTuneRouter = require('./routes/getFineTunedModellRouter');
const getModelsRouter = require('./routes/getModelsRouter');

const app = express();

app.use(express.json({ limit: '25mb' }));

app.use(express.urlencoded({ extended: true, limit: '25mb' }));

app.use(helmet());

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

const limiter = rateLimit({
  max: 100,
  windowsMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/', limiter);
app.use('/upload', createJsonlRouter);
app.use('/fine-tune', getFineTuneRouter);
app.use('/models', getModelsRouter);

app.get('health', (req, res) => {
  res.json({ message: 'OK' });
});

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
