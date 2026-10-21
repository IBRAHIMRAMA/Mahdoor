const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    unit: { type: String, required: true }, // kg, liter, piece, etc.
    unitCost: { 
        type: Number, 
        required: true, 
        min: [0.01, 'Cost must be greater than 0'] 
    },
    yield: { 
        type: Number, 
        required: true, 
        min: [1, 'Yield must be between 1 and 100'], 
        max: [100, 'Yield must be between 1 and 100'],
        default: 100
    },
    shelfLife: { 
        type: Number, 
        required: true, 
        min: [1, 'Shelf life must be at least 1 day'] 
    },
    preferredVendor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Vendor', 
        default: null 
    },
    leadTime: { 
        type: Number, 
        default: 0, 
        min: [0, 'Lead time cannot be negative'] 
    },
    isActive: { type: Boolean, default: true }, // For cancellation instead of permanent deletion
    restaurant_Id: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Ingredient', ingredientSchema);