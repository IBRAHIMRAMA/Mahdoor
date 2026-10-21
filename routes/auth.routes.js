const express = require('express')
const router = express.Router()
const { signUp, confirmEmailOTP, reSendOTP, login } = require('../controllers/auth.controller')
router.route('/signup').post(signUp)
router.route('/verify-email').post(confirmEmailOTP)
router.route('/resend-otp').post(reSendOTP)
router.route('/login').post(login)

module.exports = router