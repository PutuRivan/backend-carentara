const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Router = require('../router');
const { PORT } = require('../config/index')
const session = require('express-session')

const app = express();
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

app.use(Router)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});