const Batch = require('../models/batch.model.js');
const Ingredient = require('../models/ingredient.model.js');
const asyncHandler = require('express-async-handler');

// Adding a new batch for a specific component
const createBatch = asyncHandler(async (req, res) => {
    const { ingredient, vendor, quantityReceived, unitCost, expiryDate, status, restaurant_Id } = req.body;

    if (!ingredient || !vendor || quantityReceived === undefined || !unitCost || !expiryDate || !restaurant_Id) {
        return res.status(400).json({ success: false, msg: 'All required batch fields must be provided' });
    }

    // Validation: Quantity and unit cost must be greater than 0
    if (quantityReceived <= 0 || unitCost <= 0) {
        return res.status(400).json({ success: false, msg: 'Quantity and unit price must be greater than zero' });
    }

    // Validation: Expiry date cannot be in the past
    const now = new Date();
    if (new Date(expiryDate) <= now) {
        return res.status(400).json({ success: false, msg: 'Expiry date must be in the future' });
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

// Update an upcoming batch
const updateBatch = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { quantityReceived, unitCost, expiryDate, vendor, status } = req.body;

    const batch = await Batch.findById(id);
    if (!batch) {
        return res.status(404).json({ success: false, msg: 'Batch not found' });
    }

    // A Received or Cancelled batch is read-only
    if (batch.status !== 'Upcoming') {
        return res.status(400).json({ success: false, msg: 'Only Upcoming batches can be edited' });
    }

    batch.quantityReceived = quantityReceived !== undefined ? quantityReceived : batch.quantityReceived;
    batch.quantityLeft = quantityReceived !== undefined ? quantityReceived : batch.quantityLeft;
    batch.unitCost = unitCost !== undefined ? unitCost : batch.unitCost;
    batch.expiryDate = expiryDate || batch.expiryDate;
    batch.vendor = vendor || batch.vendor;
    batch.status = status || batch.status;

    const updatedBatch = await batch.save();

    return res.status(200).json({
        success: true,
        data: updatedBatch
    });
});

// Cancel an upcoming batch
const cancelBatch = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const batch = await Batch.findById(id);
    if (!batch) {
        return res.status(404).json({ success: false, msg: 'Batch not found' });
    }

    if (batch.status !== 'Upcoming') {
        return res.status(400).json({ success: false, msg: 'Only Upcoming batches can be cancelled' });
    }

    batch.status = 'Cancelled';
    batch.quantityLeft = 0; // Stop counting as on order
    await batch.save();

    return res.status(200).json({
        success: true,
        msg: 'Batch cancelled successfully',
        data: batch
    });
});

// Mark an upcoming batch as received (Task MAH-70)
const markBatchAsReceived = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { quantityReceived, unitCost, expiryDate } = req.body;

    const batch = await Batch.findById(id);
    if (!batch) {
        return res.status(404).json({ success: false, msg: 'Batch not found' });
    }

    if (batch.status !== 'Upcoming') {
        return res.status(400).json({ success: false, msg: 'Only Upcoming batches can be marked as received' });
    }

    // Validation for empty or invalid fields
    const finalQuantity = quantityReceived !== undefined ? quantityReceived : batch.quantityReceived;
    const finalUnitCost = unitCost !== undefined ? unitCost : batch.unitCost;
    const finalExpiryDate = expiryDate || batch.expiryDate;

    if (finalQuantity <= 0 || finalUnitCost <= 0) {
        return res.status(400).json({ success: false, msg: 'Quantity and unit price must be greater than zero' });
    }

    const now = new Date();
    if (new Date(finalExpiryDate) <= now) {
        return res.status(400).json({ success: false, msg: 'Expiry date must be in the future' });
    }

    // Update batch status and quantities
    batch.status = 'Received';
    batch.quantityReceived = finalQuantity;
    batch.quantityLeft = finalQuantity; // Stock goes up now
    batch.unitCost = finalUnitCost;
    batch.expiryDate = finalExpiryDate;

    await batch.save();

    // Update ingredient's current unit cost to this batch's unit price
    await Ingredient.findByIdAndUpdate(batch.ingredient, { unitCost: finalUnitCost });

    return res.status(200).json({
        success: true,
        msg: 'Batch marked as received successfully',
        data: batch
    });
});

module.exports = {
    createBatch,
    getIngredientBatchesAndStock,
    updateBatch,
    cancelBatch,
    markBatchAsReceived
};