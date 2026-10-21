const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    notes: { type: String, default: '' },
    restaurant_Id: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);