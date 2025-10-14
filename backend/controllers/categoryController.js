const Category = require('../models/Category');
const Product = require('../models/Product');
const { formatDocuments, formatDocument } = require('../utils/formatResponse');

const getAllCategories = async (req, res) => {
  try {
    const withProductCount = req.query.with_products === 'true';
    
    if (withProductCount) {
      // Get categories with product counts
      const categories = await Category.aggregate([
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: 'category',
            as: 'products'
          }
        },
        {
          $addFields: {
            product_count: {
              $size: {
                $filter: {
                  input: '$products',
                  cond: { $eq: ['$$this.isActive', true] }
                }
              }
            }
          }
        },
        {
          $project: {
            products: 0
          }
        },
        {
          $sort: { name: 1 }
        }
      ]);
      
      // Use formatDocuments utility to ensure consistent formatting
      const formattedCategories = categories.map(category => {
        // First format with our utility
        const formatted = formatDocument(category);
        // Then add product_count if it exists
        if (category.product_count !== undefined) {
          formatted.product_count = category.product_count;
        }
        return formatted;
      });
      
      res.json({ categories: formattedCategories });
    } else {
      // Get all categories
      const categories = await Category.find().sort({ name: 1 });
      
      // Format categories for frontend compatibility
      const formattedCategories = formatDocuments(categories);
      
      res.json({ categories: formattedCategories });
    }
  } catch (error) {
    console.error('Get categories error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate category ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Format category for frontend compatibility
    const formattedCategory = formatDocument(category);
    
    res.json({ category: formattedCategory });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Failed to fetch category' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingCategory) {
      return res.status(400).json({ message: 'Category name already exists' });
    }
    
    // Handle image upload
    let image = null;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }
    
    const category = new Category({ name, description, image });
    await category.save();
    
    // Format category for frontend compatibility
    const formattedCategory = formatDocument(category);
    
    res.status(201).json({
      message: 'Category created successfully',
      category: formattedCategory
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Failed to create category' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // Validate category ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    
    // Check if category name already exists (excluding current category)
    if (name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id }
      });
      
      if (existingCategory) {
        return res.status(400).json({ message: 'Category name already exists' });
      }
    }
    
    // Handle image upload
    const updateData = { name, description };
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }
    
    const category = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Format category for frontend compatibility
    const formattedCategory = formatDocument(category);
    
    res.json({
      message: 'Category updated successfully',
      category: formattedCategory
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Failed to update category' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate category ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    
    // Check if category has products
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category that has products. Please remove all products first.' 
      });
    }
    
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Failed to delete category' });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};