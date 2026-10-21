const { userModel, validateLoginUser, validateSignupUser } = require('../models/users')
const { sendOtp } = require('../utils/sendmail')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
require('dotenv').config()
const asyncHandler = require('express-async-handler')

// signup user and sending otp to user email 
const signUp = asyncHandler(async (req, res) => {
    const { error } = validateSignupUser(req.body)
    if (error) {
        return res.status(400).json({ success: false, msg: error.details[0].message })
    }

    let user = await userModel.findOne({ email: req.body.email })
    if (user) {
        return res.status(400).json({ success: false, msg: 'User was registered, you can log in directly' })
    }

    const password = await bcrypt.hash(req.body.password, +process.env.USER_PASS_SALT)

    const otp = crypto.randomInt(100000, 1000000).toString()
    console.log(" OTP Code is: ", otp);

    const hashedOtp = await bcrypt.hash(otp, +process.env.OTP_SALT)
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000)

    user = new userModel({
        name: req.body.name,
        age: req.body.age,
        gender: req.body.gender,
        email: req.body.email,
        password: password,
        role: req.body.role,
        emailOtp: hashedOtp,
        emailOtpExpires: otpExpires,
        restaurant_Id: req.body.restaurant_Id
    })
    await user.save()

    try {
        await sendOtp(req.body.email, otp)
    } catch (err) {
        return res.status(500).json({
            success: false,
            msg: 'Account created but we could not send the OTP email. Please use re-send OTP.',
        })
    }

    return res.status(200).json({
        success: true,
        msg: 'OTP was sent to your email, now you must confirm your account, without confirmation you cant login.',
    })
})

// confirm email with the otp
const confirmEmailOTP = asyncHandler(async (req, res) => {
    const { email, OTP } = req.body

    if (!OTP || !email) {
        return res.status(400).json({ success: false, msg: 'Please send your email and OTP' })
    }

    const user = await userModel.findOne({ email })
    if (!user) {
        return res.status(400).json({ success: false, msg: 'user not found' })
    }

    if (user.isEmailVerifified) {
        return res.status(400).json({ success: false, msg: 'user email was already confirmed' })
    }

    if (!user.emailOtp || !user.emailOtpExpires || user.emailOtpExpires.getTime() <= Date.now()) {
        return res.status(400).json({ success: false, msg: 'invalid or expired OTP' })
    }

    const isOtpMatches = await bcrypt.compare(String(OTP), user.emailOtp)
    if (!isOtpMatches) {
        return res.status(400).json({ success: false, msg: 'invalid or expired OTP' })
    }

    user.isEmailVerifified = true
    user.emailOtp = null
    user.emailOtpExpires = null
    await user.save()

    return res.status(200).json({ success: true, msg: 'verification succeeded' })
})

// resend OTP
const reSendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body
    if (!email) {
        return res.status(400).json({ success: false, msg: 'Please send your email' })
    }

    const existing = await userModel.findOne({ email })
    if (!existing) {
        return res.status(400).json({ success: false, msg: 'user not found' })
    }
    if (existing.isEmailVerifified) {
        return res.status(400).json({ success: false, msg: 'user email was already confirmed' })
    }

    const otp = crypto.randomInt(100000, 1000000).toString()
    const hashedOtp = await bcrypt.hash(otp, +process.env.OTP_SALT)
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000)

    existing.emailOtp = hashedOtp
    existing.emailOtpExpires = otpExpires
    await existing.save()

    try {
        await sendOtp(email, otp)
    } catch (err) {
        return res.status(500).json({ success: false, msg: 'Could not send the OTP email, try again.' })
    }

    return res.status(200).json({
        success: true,
        msg: 'OTP was sent to your email, now you must confirm your account, without confirmation you cant login.',
    })
})

// login and generate token
const login = asyncHandler(async (req, res) => {
    const { error } = validateLoginUser(req.body)
    if (error) {
        return res.status(400).json({ msg: error.details[0].message })
    }
    let user = await userModel.findOne({ email: req.body.email })
    if (!user) {
        return res.status(404).json({ msg: 'email or password was wrong' })
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password)
    if (!isMatch) {
        return res.status(400).json({ msg: "email or password was wrong" })
    }

    const token = jwt.sign(
        { id: user._id, name: user.name, role: user.role, restaurant_Id: user.restaurant_Id }, 
        process.env.SECRETE_KEY, 
        { expiresIn: "2w" }
    )

    const { password, ...other } = user._doc
    return res.status(200).json({ msg: "login successfully", profile: { ...other, token } })
})

module.exports = { signUp, login, confirmEmailOTP, reSendOTP }