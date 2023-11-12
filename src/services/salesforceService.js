const { response } = require("express");
const jsforce = require("jsforce");
const LocalStorage = require("node-localstorage").LocalStorage;
const lcStorage = new LocalStorage("./info");

const {
  SF_LOGIN_URL,
  SF_CLIENT_ID,
  SF_CLIENT_SECRET,
  SF_CALLBACK_URL,
  APP_URL,
} = require("../config");

//*Initialize OAuth2 Config

const oauth2 = new jsforce.OAuth2({
  loginUrl: SF_LOGIN_URL,
  clientId: SF_CLIENT_ID,
  clientSecret: SF_CLIENT_SECRET,
  redirectUri: SF_CALLBACK_URL,
});

//*Function to perform Salesforce Login

const login = (req, res) => {
  res.redirect(oauth2.getAuthorizationUrl({ scope: "full" }));
};

//*Callback function to get Salesforce Auth token
const callback = (req, res) => {
  const { code } = req.query;
  if (!code) {
    let status = "Failed to get authorization code from server callback";
   // console.log(status);
    return res.status(500).send(status);
  }

  //console.log("code ", code);
  const conn = new jsforce.Connection({ oauth2: oauth2 });
  conn.authorize(code, function (err) {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }

   // console.log("Access Token: ", conn.accessToken);
    //* console.log("Refresh Token: ", conn.refreshToken);
    //* console.log("Instance URL: ", conn.instanceUrl);
    lcStorage.setItem("accessToken", conn.accessToken || "");
    lcStorage.setItem("instanceUrl", conn.instanceUrl || "");
    res.redirect(APP_URL);
  });
};

//* Function to create connection
const createConnection = (res) =>{
  let accessToken = lcStorage.getItem("accessToken");
  let instanceUrl = lcStorage.getItem("instanceUrl");
  if (!accessToken) {
    return res.status(200).send({});
  }

  return new jsforce.Connection({
    accessToken,
    instanceUrl,
  });
}
//*Function to get logged-in user details
const whoami = (req, res) => {
 
  const conn = createConnection(res)

  conn.identity((err, data) => {
    if (err) {
      //*do error handling
      handleSalesforceError(err, res);
    }

    res.json(data);
  });
};

//* function to perform salesforce logout and clrea localstorage
const logout = (req, res) => {
  console.log("LOGOUTTT");
  lcStorage.clear();
  res.redirect(`${APP_URL}/login`);
};

//** Function to get expenses from Salesforce
const getExpenses = (req, res) => {
  const conn = createConnection(res)

  //*perform query to fetch expenses from Salesforce
  conn.query(
    "SELECT Id, Amount__c, Date__c, Name, Expense_Name__c, Category__c,Notes__c FROM Expense__c ORDER BY Date__c DESC",
    function (err, result) {
      if (err) {
        handleSalesforceError(err, res);
        return;
      }
      res.json(result);
    }
  );
};

//** Function to create expense from Salesforce
const createExpense = (req, res) => {
  const conn = createConnection(res)

  const { Expense_Name__c, Amount__c, Date__c, Notes__c, Category__c } = req.body;

  //*perform query to fetch expenses from Salesforce
  conn.sobject("Expense__c").create({ Expense_Name__c, Amount__c, Date__c, Notes__c, Category__c } 
    ,
    function (err, result) {
      if (err) {
        handleSalesforceError(err, res);
        return;
      }
     // console.log("RESULTTTT", result);
      res.json(result);
    }
  );
};
//** Function to update an Expense record from Salesforce
const updateExpense = (req, res) => {
  const conn = createConnection(res)

  const {id} = req.params
  const { Expense_Name__c, Amount__c, Date__c, Notes__c, Category__c } = req.body;

  //*perform query to update expenses from Salesforce
  conn.sobject("Expense__c").update({ Id:id,Expense_Name__c, Amount__c, Date__c, Notes__c, Category__c } 
    ,
    function (err, result) {
      if (err) {
        handleSalesforceError(err, res);
        return;
      }
     // console.log("Result Update", result);
      res.json(result);
    }
  );
};

//** Function to delete an Expense record from Salesforce
const deleteExpense = (req, res) => {
  const conn = createConnection(res)

  const {id} = req.params

  //*perform query to update expenses from Salesforce
  conn.sobject("Expense__c").destroy(id,
    function (err, result) {
      if (err) {
        handleSalesforceError(err, res);
        return;
      }
   //   console.log("Result Update", result);
      res.json(result);
    }
  );
};

const handleSalesforceError = (err, res) => {
  if (err.errorCode === "INVALID_SESSION_ID") {
    lcStorage.clear();
    res.status(200).send({});
  } else {
    //console.error("ERROR", err);
    res.status(500).send(err);
  }
};

module.exports = {
  login,
  callback,
  whoami,
  logout,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense
};
