const express = require('express');
const { body, param, validationResult } = require('express-validator');
const categoryController = require('../controllers/categoryController');
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
const categoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  validate
];

const paramIdValidation = [
  param('id')
    .isString()
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage('Category ID must be a valid MongoDB ObjectId'),
  validate
];

// Routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', paramIdValidation, categoryController.getCategoryById);

// Admin routes
router.post('/', auth.authenticateToken, auth.authorizeAdmin, upload.single('image'), handleMulterError, categoryValidation, categoryController.createCategory);
router.put('/:id', auth.authenticateToken, auth.authorizeAdmin, paramIdValidation, upload.single('image'), handleMulterError, categoryValidation, categoryController.updateCategory);
router.delete('/:id', auth.authenticateToken, auth.authorizeAdmin, paramIdValidation, categoryController.deleteCategory);

module.exports = router;