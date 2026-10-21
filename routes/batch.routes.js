const express = require('express');
const router = express.Router();
const { 
    createBatch, 
    getIngredientBatchesAndStock 
} = require('../controllers/batch.controller');

router.post('/', createBatch); // Adding a new batch

// Retrieving batches of a specific item, along with the calculation of available inventory.
router.get('/ingredient/:ingredientId', getIngredientBatchesAndStock); 

module.exports = router;