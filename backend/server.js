const express = require('express');
const cors = require('cors');
require('dotenv').config();

const uploadRoute = require('./routes/upload');
const chatRoute = require('./routes/chat');

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.setTimeout(120000);
  next();
});

app.use('/api/upload', uploadRoute);
app.use('/api/chat', chatRoute);

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});