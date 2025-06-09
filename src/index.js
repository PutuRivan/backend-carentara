const express = require('express');
const bodyParser = require('body-parser');
const Router = require('./router');
const { PORT } = require('./config/index')

const app = express();
app.use(express.json());
app.use(bodyParser.json());


app.use(Router)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});