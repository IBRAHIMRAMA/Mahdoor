const Ingredient = require('../models/ingredient.model.js');
const asyncHandler = require('express-async-handler');

// Adding a new component with condition validation
const createIngredient = asyncHandler(async (req, res) => {
    const { name, unit, unitCost, yield: yieldVal, shelfLife, preferredVendor, leadTime, restaurant_Id } = req.body;

    // Verification of the required conditions
    if (unitCost <= 0 || shelfLife <= 0) {
        return res.status(400).json({ success: false, msg: 'Cost and shelf life must be greater than 0' });
    }

    if (yieldVal < 1 || yieldVal > 100) {
        return res.status(400).json({ success: false, msg: 'Yield must be between 1 and 100' });
    }

    if (leadTime < 0) {
        return res.status(400).json({ success: false, msg: 'Lead time cannot be negative' });
    }

    const ingredient = await Ingredient.create({
        name,
        unit,
        unitCost,
        yield: yieldVal,
        shelfLife,
        preferredVendor: preferredVendor || null,
        leadTime: leadTime || 0,
        restaurant_Id
    });

    return res.status(201).json({
        success: true,
        data: ingredient
    });
});

// Bring only the active ingredients to the main table and the recipes.
const getIngredients = asyncHandler(async (req, res) => {
    const { restaurant_Id } = req.query;
    
    const query = { isActive: true };
    if (restaurant_Id) query.restaurant_Id = restaurant_Id;

    const ingredients = await Ingredient.find(query).populate('preferredVendor', 'name phone notes');

    return res.status(200).json({
        success: true,
        count: ingredients.length,
        data: ingredients
    });
});


const updateIngredient = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { unitCost, yield: yieldVal, shelfLife, leadTime } = req.body;

    if (unitCost !== undefined && unitCost <= 0) {
        return res.status(400).json({ success: false, msg: 'Cost must be greater than 0' });
    }
    if (shelfLife !== undefined && shelfLife <= 0) {
        return res.status(400).json({ success: false, msg: 'Shelf life must be greater than 0' });
    }
    if (yieldVal !== undefined && (yieldVal < 1 || yieldVal > 100)) {
        return res.status(400).json({ success: false, msg: 'Yield must be between 1 and 100' });
    }

    const ingredient = await Ingredient.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
    }).populate('preferredVendor', 'name phone notes');

    if (!ingredient) {
        return res.status(404).json({ success: false, msg: 'Ingredient not found' });
    }

    return res.status(200).json({
        success: true,
        data: ingredient
    });
});

// Deactivate the component instead of deleting it permanently
const deactivateIngredient = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const ingredient = await Ingredient.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
    );

    if (!ingredient) {
        return res.status(404).json({ success: false, msg: 'Ingredient not found' });
    }

    return res.status(200).json({
        success: true,
        msg: 'Ingredient deactivated successfully',
        data: ingredient
    });
});

module.exports = {
    createIngredient,
    getIngredients,
    updateIngredient,
    deactivateIngredient
};