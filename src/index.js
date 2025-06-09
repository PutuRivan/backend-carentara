const express = require('express');
const bodyParser = require('body-parser');
const Router = require('./router');

const app = express();
app.use(express.json());
app.use(bodyParser.json());


app.use(Router)

app.listen(3000, () => {
  console.log('Server running on port 3000');
});