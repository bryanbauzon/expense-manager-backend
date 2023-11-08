
const jsforce = require('jsforce')
const {SF_LOGIN_URL, SF_CLIENT_ID, SF_CLIENT_SECRET, SF_CALLBACK_URL} = require('../config')

//Initialize OAuth2 Config

const oauth2 = new jsforce.OAuth2({
    loginUrl: SF_LOGIN_URL,
    clientId : SF_CLIENT_ID,
    clientSecret : SF_CLIENT_SECRET,
    redirectUri : SF_CALLBACK_URL
})

//Function to perform Salesforce Login

const login = (req, res) =>{
    res.redirect(oauth2.getAuthorizationUrl({ scope : 'full' }));
}

//Callback function to get Salesforce Auth token
const callback = (req, res) =>{
    const {code} = req.query

    console.log('req.query ',req.query)
}

module.exports={
    login, callback
}