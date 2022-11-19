const mongoose = require('mongoose');

const fs = require('fs');

const dotenv = require('dotenv');

const Tour = require(`../../models/tourModel`);
const Review = require(`../../models/reviewModel`);
const User = require(`../../models/userModel`);

dotenv.config({ path: `${__dirname}/../../config.env` });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
console.log(DB);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('connected to ATLAS DATABASE');
  });

const tours = fs.readFileSync(`${__dirname}/tours.json`, 'utf-8');
const users = fs.readFileSync(`${__dirname}/users.json`, 'utf-8');
const reviews = fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8');

//IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(JSON.parse(tours));
    await User.create(JSON.parse(users, { validateBeforeSave: false }));
    await Review.create(JSON.parse(reviews));

    console.log('DATA SUCCESSFULLY LOADED');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//DELETE DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('DATA SUCCESSFULLY DELETED');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// PROCESS.ARGV RETURNS ARRAY OF ARGUMENT VECTORS OF A COMMAND IN COMMAND LINE
console.log(process.argv);

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
