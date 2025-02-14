require('dotenv').config()

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Basic Configuration
const port = 3000;

app.use(require("./routes/app"));
app.use(require("./routes/auth"));

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});