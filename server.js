//PROCESS ENVIRONMENT
const dotenv = require('dotenv');

const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log(err.status, err.message);
  console.log('UNCAUGHT EXCEPTION!💥💥 Shutting down...!');
  console.log(err);

  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
console.log(DB);
console.log('daatabase');

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('connected to ATLAS DATABASE');
  });

//STARTING SERVER ON PORT
const port = process.env.PORT || 3000;
const server = app.listen(port);

process.on('unhandledRejection', (err) => {
  console.log(err.status, err.message);
  console.log('UNHANDLED REJECTION!💥💥 Shutting down...!');
  server.close(() => {
    process.exit(1);
  });
});
