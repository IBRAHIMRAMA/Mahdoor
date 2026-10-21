const Vendor = require('../models/vendor.model.js');
const Ingredient = require('../models/ingredient.model.js'); 
const asyncHandler = require('express-async-handler');

// Adding a new resource (which can be used directly from the components form)
const createVendor = asyncHandler(async (req, res) => {
    const { name, phone, notes, restaurant_Id } = req.body;

    if (!name || !phone || !restaurant_Id) {
        return res.status(400).json({ success: false, msg: 'Name, phone, and restaurant_Id are required' });
    }

    const vendor = await Vendor.create({ name, phone, notes, restaurant_Id });

    return res.status(201).json({
        success: true,
        data: vendor
    });
});

// Retrieve all suppliers for a specific restaurant
const getVendors = asyncHandler(async (req, res) => {
    const { restaurant_Id } = req.query;
    
    const query = restaurant_Id ? { restaurant_Id } : {};
    const vendors = await Vendor.find(query);

    return res.status(200).json({
        success: true,
        count: vendors.length,
        data: vendors
    });
});

//Retrieve details for a specific supplier, along with their associated list of components.
const getVendorDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const vendor = await Vendor.findById(id);
    if (!vendor) {
        return res.status(404).json({ success: false, msg: 'Vendor not found' });
    }

    // Retrieve all components associated with this resource as a preferred resource
    const ingredients = await Ingredient.find({ preferredVendor: id, isActive: true });

    return res.status(200).json({
        success: true,
        data: {
            vendor,
            ingredients
        }
    });
});

// Update supplier data
const updateVendor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, phone, notes } = req.body;

    const vendor = await Vendor.findByIdAndUpdate(
        id,
        { name, phone, notes },
        { new: true, runValidators: true }
    );

    if (!vendor) {
        return res.status(404).json({ success: false, msg: 'Vendor not found' });
    }

    return res.status(200).json({
        success: true,
        data: vendor
    });
});

module.exports = {
    createVendor,
    getVendors,
    updateVendor,
    getVendorDetails
};