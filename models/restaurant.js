const mongoose = require('mongoose')

const restaurantSchema = new mongoose.Schema({
    brand: { type: String, required: true, minlength: 10, maxlength: 50 },
    branchNumber: { type: Number, required: true, min: 0 },
    location: { type: String, required: true, minlength: 10, maxlength: 50 },
})

const restaurantModel = mongoose.model('Restaurant', restaurantSchema)
module.exports = { restaurantModel }