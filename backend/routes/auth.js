const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
// Rate limiting has been disabled, so we're not importing authLimiter

const router = express.Router();

console.log('=== AUTH ROUTES LOADING ===');

// Register route with enhanced validation
router.post('/register', [
  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .trim()
    .escape(),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('address')
    .optional()
    .trim()
    .escape()
], authController.register);

// Login route
router.post('/login', [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], authController.login);

// Get profile (protected route)
router.get('/profile', auth.authenticateToken, authController.getProfile);

// Update profile (protected route)
router.put('/profile', auth.authenticateToken, [
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .trim()
    .escape(),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('address')
    .optional()
    .trim()
    .escape()
], authController.updateProfile);

// Change password (protected route)
router.put('/change-password', auth.authenticateToken, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number and one special character')
], authController.changePassword);

// Verify token (protected route)
router.get('/verify', auth.authenticateToken, authController.verifyToken);

// Admin routes (protected and admin-only)
router.get('/users', (req, res, next) => {
  console.log('=== USERS ROUTE MIDDLEWARE HIT ===');
  next();
}, auth.authenticateToken, authController.getAllUsers);

router.delete('/users/:id', auth.authenticateToken, authController.deleteUser);

module.exports = router;