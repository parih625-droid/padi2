const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const generateToken = (userId) => {
  console.log('Generating token for userId:', userId);
  console.log('JWT_SECRET from env:', process.env.JWT_SECRET);
  console.log('JWT_SECRET type:', typeof process.env.JWT_SECRET);
  console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length);
  
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not defined!');
    throw new Error('JWT_SECRET is not defined');
  }
  
  if (typeof secret !== 'string') {
    console.error('JWT_SECRET is not a string:', typeof secret);
    throw new Error('JWT_SECRET is not a string');
  }
  
  if (secret.length === 0) {
    console.error('JWT_SECRET is empty!');
    throw new Error('JWT_SECRET is empty');
  }
  
  return jwt.sign({ userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      address
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Remove password from user object and format for frontend
    const userObj = user.toObject();
    delete userObj.password;
    const formattedUser = {
      ...userObj,
      id: userObj._id.toString(),
      created_at: userObj.createdAt,
      updated_at: userObj.updatedAt
    };

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: formattedUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    console.log('Login endpoint hit');
    console.log('Request body:', req.body);
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log('User found:', user);
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    console.log('Checking password for user:', user.email);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);
    if (!isPasswordValid) {
      console.log('Invalid password for user:', user.email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    console.log('Generating token for user:', user._id);
    const token = generateToken(user._id);

    // Remove password from user object and format for frontend
    const userObj = user.toObject();
    delete userObj.password;
    const formattedUser = {
      ...userObj,
      id: userObj._id.toString(),
      created_at: userObj.createdAt,
      updated_at: userObj.updatedAt
    };

    res.json({
      message: 'Login successful',
      token,
      user: formattedUser
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Format user data for frontend compatibility
    const userObj = user.toObject();
    const formattedUser = {
      ...userObj,
      id: userObj._id.toString(),
      created_at: userObj.createdAt,
      updated_at: userObj.updatedAt
    };

    res.json({ user: formattedUser });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, phone, address } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Format user data for frontend compatibility
    const userObj = user.toObject();
    const formattedUser = {
      ...userObj,
      id: userObj._id.toString(),
      created_at: userObj.createdAt,
      updated_at: userObj.updatedAt
    };

    res.json({
      message: 'Profile updated successfully',
      user: formattedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get user with password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
};

const verifyToken = async (req, res) => {
  try {
    // Token is already verified by middleware
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Format user data for frontend compatibility
    const userObj = user.toObject();
    const formattedUser = {
      ...userObj,
      id: userObj._id.toString(),
      created_at: userObj.createdAt,
      updated_at: userObj.updatedAt
    };
    
    res.json({
      valid: true,
      user: formattedUser
    });
  } catch (error) {
    res.status(401).json({
      valid: false,
      message: 'Invalid token'
    });
  }
};

// Admin function to get all users
const getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    const currentUser = await User.findById(req.user._id);
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    // Get all users except passwords
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    // Format users for frontend compatibility
    const formattedUsers = users.map(user => {
      const userObj = user.toObject();
      return {
        ...userObj,
        id: userObj._id.toString(),
        created_at: userObj.createdAt,
        updated_at: userObj.updatedAt
      };
    });
    
    res.json({ users: formattedUsers });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// Admin function to delete a user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is admin
    const currentUser = await User.findById(req.user._id);
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    
    // Prevent admin from deleting themselves
    if (id === currentUser._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete yourself' });
    }
    
    // Check if user exists and is not an admin
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deletion of other admins
    if (userToDelete.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }
    
    // Delete the user
    await User.findByIdAndDelete(id);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  verifyToken,
  getAllUsers,
  deleteUser
};