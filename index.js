const express = require("express");
const jsforce = require("jsforce");
const {
  PORT,
  SERVER_URL
} = require("./src/config");
const app = express();
const authController = require('./src/controllers/authController')

//create a test api to check if server is running
app.get("/test", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

app.use('/oauth2', authController)

app.listen(PORT, () => {
  console.log(`Server is running on ${SERVER_URL}`);
});


