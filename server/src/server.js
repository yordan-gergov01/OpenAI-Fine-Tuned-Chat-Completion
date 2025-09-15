const dotenv = require('dotenv');

// triggered when an exception occurs in synchronous code and is not handled by try...catch
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);

  process.exit(1);
});

dotenv.config({ path: './.env' });

const app = require('./app');

const PORT = process.env.APP_PORT || 3000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started at port ${PORT}...`);
});

// triggered when there is a raw Promise rejection
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
