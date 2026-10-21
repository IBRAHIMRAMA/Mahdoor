const express = require('express');
const router = express.Router();
const { 
    createIngredient, 
    getIngredients, 
    updateIngredient, 
    deactivateIngredient 
} = require('../controllers/ingredient.controller');

router.post('/', createIngredient);
router.get('/', getIngredients);
router.put('/:id', updateIngredient);
router.patch('/:id/deactivate', deactivateIngredient); // To deactivate instead of delete

module.exports = router;