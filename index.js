const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors')
const {
  PORT,
  BACKEND_URL, APP_URL
} = require("./src/config");
const app = express();
const authController = require('./src/controllers/authController')
const expenseController = require('./src/controllers/expenseController')

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
const allowedOrigins = [APP_URL]
app.use(cors({
  origin:allowedOrigins

}))
//create a test api to check if server is running
app.get("/test", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

app.use('/oauth2', authController)
app.use('/expenses',expenseController)
app.listen(PORT, () => {
  console.log(`Server is running on ${BACKEND_URL}`);
});


