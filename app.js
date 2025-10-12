// app.js
require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Food Donor Backend Server is Running!');
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
