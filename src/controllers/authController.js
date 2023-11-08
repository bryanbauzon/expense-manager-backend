const express = require('express')
const router = express.Router();
const salesforceService = require('../services/salesforceService')
router.get('/login',salesforceService.login)
router.get('/callback', salesforceService.callback)
module.exports = router