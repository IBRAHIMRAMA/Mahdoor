const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const { userModel } = require('../models/users')
const { sendEmail } = require('../utils/sendmail')
require('dotenv').config()

//  user must be clicked on forgot-password and ui make it then i take email from this page
const sendForgotPassLink = asyncHandler(async (req, res) => {
    const email = req.body.email
    let user = await userModel.findOne({ email })
    console.log(user.email);

    if (!user) {
        return res.status(404).json({ success: false, msg: 'user not found ' })
    }
    const secret = process.env.SECRETE_KEY + user.password
    const port = process.env.PORT
    const token = jwt.sign({ email: user.email, id: user._id }, secret, { expiresIn: "10m" })
    const link = `http://localhost:${port}/api/password/reset-password/${user._id}/${token}`

    try {
        sendEmail(email, link)
        res.status(200).json({ success: true, msg: `email was sent to ${email}` })
    } catch (er) {
        return res.status(404).json({ msg: 'email not sent , somthing went wrong' })
    }
})
const ResetPassword = asyncHandler(async (req, res) => {
    let id = req.params.id

    token = req.params.token
    let user = await userModel.findById(id)
    if (!user) {
        return res.status(404).json({ success: false, msg: 'user not found ' })
    }
    const secret = process.env.SECRETE_KEY + user.password
    try {
        jwt.verify(token, secret)
        req.body.password = await bcrypt.hash(req.body.password, +process.env.PASS_SALT)
        user.password = req.body.password
        await user.save()
        res.status(200).json({ success: true, msg: 'password was changed.' })
    } catch (err) {
        console.log(err);
        res.status(400).json({ msg: "error" })

    }

})

module.exports = { sendForgotPassLink, ResetPassword }