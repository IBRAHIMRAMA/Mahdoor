const mongoose = require('mongoose')
const joi = require('joi')

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true, enum: ['male', 'female'] },
    email: { type: String, maxlength: 200, required: true, unique: true },
    password: { type: String, minlength: 6, maxlength: 200, required: true },
    restaurant_Id: { type: mongoose.Schema.Types.String, ref: 'Restaurant', },
    role: {
        type: String
        , enum: ["staff", "manager"], default: "staff"
    },
    isEmailVerifified: { type: Boolean, default: false },
    emailOtp: { type: String, default: null },
    emailOtpExpires: { type: Date, default: null }
})

const validateSignupUser = function (obj) {
    const schema = joi.object({
        name: joi.string().trim().min(3).max(200).required(),
        age: joi.number().required(),
        gender: joi.string().required(),
        email: joi.string().trim().required().email(),
        password: joi.string().trim().required().max(200).min(6),
        restaurant_Id: joi.string().trim(),
        role: joi.string().trim()
    })
    return schema.validate(obj)
}
const validateLoginUser = function (obj) {
    const schema = joi.object({
        email: joi.string().trim().required().email(),
        password: joi.string().trim().required().max(200).min(6),
    })
    return schema.validate(obj)
}




const userModel = mongoose.model('User', userSchema)
module.exports = { userModel, validateSignupUser, validateLoginUser }