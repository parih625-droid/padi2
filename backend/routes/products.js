const express = require('express');
const { body, param, validationResult } = require('express-validator');
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

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
const productValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Product name must be between 2 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  body('category_id')
    .isString()
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage('Category ID must be a valid MongoDB ObjectId'),
  body('stock_quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  body('is_amazing_offer')
    .optional()
    .isBoolean()
    .withMessage('Amazing offer must be a boolean value'),
  validate
];

const productUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Product name must be between 2 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  body('category_id')
    .optional()
    .isString()
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage('Category ID must be a valid MongoDB ObjectId'),
  body('stock_quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  body('is_amazing_offer')
    .optional()
    .isBoolean()
    .withMessage('Amazing offer must be a boolean value'),
  validate
];

const paramIdValidation = [
  param('id')
    .isString()
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage('Product ID must be a valid MongoDB ObjectId'),
  validate
];

const paramCategoryIdValidation = [
  param('categoryId')
    .isString()
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage('Category ID must be a valid MongoDB ObjectId'),
  validate
];

// Public routes
router.get('/', productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/newest', productController.getNewestProducts);
router.get('/search', productController.searchProducts);
router.get('/category/:categoryId', paramCategoryIdValidation, productController.getProductsByCategory);
router.get('/best-selling', productController.getBestSellingProducts); // Add this new route
router.get('/:id', paramIdValidation, productController.getProductById);

// Admin routes
router.post('/', 
  (req, res, next) => {
    console.log('Product creation route hit');
    console.log('Request headers:', req.headers);
    console.log('Content-Type:', req.headers['content-type']);
    next();
  },
  auth.authenticateToken, 
  auth.authorizeAdmin, 
  (req, res, next) => {
    console.log('After auth middleware, before upload');
    console.log('User:', req.user);
    next();
  },
  upload.array('images', 5), // Allow up to 5 images
  handleMulterError,
  productValidation, 
  (req, res, next) => {
    console.log('After validation, before controller');
    console.log('Validation errors:', validationResult(req).array());
    next();
  },
  productController.createProduct
);

router.put('/:id', 
  auth.authenticateToken, 
  auth.authorizeAdmin, 
  paramIdValidation,
  upload.array('images', 5), // Allow up to 5 images
  handleMulterError,
  productUpdateValidation, 
  productController.updateProduct
);

router.delete('/:id', 
  auth.authenticateToken, 
  auth.authorizeAdmin, 
  paramIdValidation,
  productController.deleteProduct
);

module.exports = router;