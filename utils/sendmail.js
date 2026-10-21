const nodeMailer = require('nodemailer')
require('dotenv').config()


const transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS
    }
})

const sendOtp = async (email, otp) => {
    try {
        await transporter.sendMail({
            from: process.env.USER_EMAIL,
            to: email,
            subject: 'Verify your Email ',
            text: `your verification code is ${otp} . its expire in 5 minutes  `
        })
    } catch (err) {
        return `faild to sending email due to ${err}`
    }
}

const sendEmail = async (email, link) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Reset password',
            html: `
    <p>Click on the button below to reset your password:</p>
    <a href="${link}" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">
    Reset Password
    </a>
    <p>This link expires in 10 minutes.</p>`
            ,
        })
    } catch (err) {
        return `faild to sending email due to ${err}`
    }
}


// console.log(typeof sendOtp);
module.exports = { sendOtp, sendEmail }
