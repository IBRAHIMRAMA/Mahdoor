const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
    ingredient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ingredient',
        required: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    quantityReceived: {
        type: Number,
        required: true,
        min: 0
    },
    quantityLeft: {
        type: Number,
        required: true,
        min: 0
    },
    unitCost: {
        type: Number,
        required: true,
        min: 0
    },
    expiryDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Received', 'Upcoming', 'Cancelled'],
        default: 'Received'
    },
    restaurant_Id: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);