const Batch = require('../models/batch.model.js');
const Ingredient = require('../models/ingredient.model.js');
const asyncHandler = require('express-async-handler');

// Adding a new batch for a specific component
const createBatch = asyncHandler(async (req, res) => {
    const { ingredient, vendor, quantityReceived, unitCost, expiryDate, status, restaurant_Id } = req.body;

    if (!ingredient || !vendor || quantityReceived === undefined || !unitCost || !expiryDate || !restaurant_Id) {
        return res.status(400).json({ success: false, msg: 'All required batch fields must be provided' });
    }

    const batch = await Batch.create({
        ingredient,
        vendor,
        quantityReceived,
        quantityLeft: quantityReceived, // Upon creation, the remaining quantity equals the received quantity.
        unitCost,
        expiryDate,
        status: status || 'Received',
        restaurant_Id
    });

    return res.status(201).json({
        success: true,
        data: batch
    });
});

// Retrieve component details, including payment records and the calculation of usable stock.
const getIngredientBatchesAndStock = asyncHandler(async (req, res) => {
    const { ingredientId } = req.params;

    const ingredient = await Ingredient.findById(ingredientId);
    if (!ingredient) {
        return res.status(404).json({ success: false, msg: 'Ingredient not found' });
    }

    // Retrieve all batches of this component, ordered from newest to oldest.
    const batches = await Batch.find({ ingredient: ingredientId }).sort({ createdAt: -1 }).populate('vendor', 'name phone');

    // Calculating available inventory (only batches with a status of "Received" that have not expired)
    const now = new Date();
    let usableStock = 0;

    batches.forEach(batch => {
        if (batch.status === 'Received' && new Date(batch.expiryDate) > now) {
            usableStock += batch.quantityLeft;
        }
    });

    return res.status(200).json({
        success: true,
        data: {
            ingredient,
            usableStock,
            batches
        }
    });
});

module.exports = {
    createBatch,
    getIngredientBatchesAndStock
};