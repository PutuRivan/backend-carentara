const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Router = require('../router');
const { PORT } = require('../config/index')

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

app.use(Router)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});