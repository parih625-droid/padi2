const express = require('express');
const { body, param, validationResult } = require('express-validator');
const cartController = require('../controllers/cartController');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation rules
const addToCartValidation = [
  body('product_id')
    .isString()
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage('Product ID must be a valid MongoDB ObjectId'),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
  validate
];

const updateCartValidation = [
  body('product_id')
    .isString()
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage('Product ID must be a valid MongoDB ObjectId'),
  body('quantity')
    .isInt({ min: 0, max: 100 })
    .withMessage('Quantity must be between 0 and 100'),
  validate
];

const paramProductIdValidation = [
  param('product_id')
    .isString()
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage('Product ID must be a valid MongoDB ObjectId'),
  validate
];

// Routes - all cart routes require authentication
router.get('/', auth.authenticateToken, cartController.getCart);
router.post('/', auth.authenticateToken, addToCartValidation, cartController.addToCart);
router.put('/', auth.authenticateToken, updateCartValidation, cartController.updateCartItem);
router.delete('/clear', auth.authenticateToken, cartController.clearCart);
router.delete('/:product_id', auth.authenticateToken, paramProductIdValidation, cartController.removeFromCart);
router.get('/validate', auth.authenticateToken, cartController.validateCartItems);

module.exports = router;