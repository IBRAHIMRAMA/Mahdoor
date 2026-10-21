const express = require('express')
const { sendForgotPassLink, ResetPassword } = require('../controllers/password.controller')
const router = express.Router()

router.route('/forgot-password').post(sendForgotPassLink)
router.route('/reset-password/:id/:token').post(ResetPassword)

module.exports = router