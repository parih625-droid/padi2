const Product = require('../models/Product');
const Category = require('../models/Category');
const { formatDocuments, formatDocument } = require('../utils/formatResponse');

const getAllProducts = async (req, res) => {
  try {
    const { 
      category_id, 
      search, 
      min_price, 
      max_price, 
      is_amazing_offer,
      limit = 20,
      offset = 0
    } = req.query;

    console.log('getAllProducts called with params:', { category_id, search, min_price, max_price, is_amazing_offer });

    // Build filter object
    const filter = { isActive: true };

    if (category_id) {
      console.log('Filtering by category_id:', category_id, 'type:', typeof category_id);
      // Validate category ID format
      if (category_id && !category_id.match(/^[0-9a-fA-F]{24}$/)) {
        console.log('Invalid category ID format:', category_id);
        return res.status(400).json({ message: 'Invalid category ID format' });
      }
      filter.category = category_id;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (min_price || max_price) {
      filter.price = {};
      if (min_price) filter.price.$gte = parseFloat(min_price);
      if (max_price) filter.price.$lte = parseFloat(max_price);
    }

    if (is_amazing_offer !== undefined) {
      filter.isAmazingOffer = is_amazing_offer === 'true';
    }

    // Convert limit and offset to numbers
    const limitNum = Math.min(parseInt(limit) || 20, 50);
    const offsetNum = parseInt(offset) || 0;

    console.log('Final filter object:', filter);

    const products = await Product.find(filter)
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(offsetNum)
      .limit(limitNum);

    // Format products for frontend compatibility
    const formattedProducts = formatDocuments(products);

    res.json({ products: formattedProducts });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 8, 50);
    
    const products = await Product.find({ isActive: true })
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Format products for frontend compatibility
    const formattedProducts = formatDocuments(products);

    res.json({ products: formattedProducts });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ message: 'Failed to fetch featured products' });
  }
};

const getNewestProducts = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    
    const products = await Product.find({ isActive: true })
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Format products for frontend compatibility
    const formattedProducts = formatDocuments(products);

    res.json({ products: formattedProducts });
  } catch (error) {
    console.error('Get newest products error:', error);
    res.status(500).json({ message: 'Failed to fetch newest products' });
  }
};

const getBestSellingProducts = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const offset = parseInt(req.query.offset) || 0;
    
    const products = await Product.find({ isActive: true })
      .populate('category', 'name')
      .sort({ salesCount: -1 })
      .skip(offset)
      .limit(limit);

    // Format products for frontend compatibility
    const formattedProducts = formatDocuments(products);

    res.json({ products: formattedProducts });
  } catch (error) {
    console.error('Get best selling products error:', error);
    res.status(500).json({ message: 'Failed to fetch best selling products' });
  }
};

const searchProducts = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const limitNum = Math.min(parseInt(limit) || 20, 50);

    const products = await Product.find({
      $text: { $search: q },
      isActive: true
    })
    .populate('category', 'name')
    .limit(limitNum);

    // Format products for frontend compatibility
    const formattedProducts = formatDocuments(products);

    res.json({ products: formattedProducts });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ message: 'Failed to search products' });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);

    // Validate category ID
    if (!categoryId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const products = await Product.find({
      category: categoryId,
      isActive: true
    })
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .limit(limit);

    // Format products for frontend compatibility
    const formattedProducts = formatDocuments(products);

    res.json({ products: formattedProducts });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ message: 'Failed to fetch products by category' });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate product ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(id)
      .populate('category', 'name');

    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Format product for frontend compatibility
    const formattedProduct = formatDocument(product);

    res.json({ product: formattedProduct });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
};

const createProduct = async (req, res) => {
  try {
    console.log('Create product request received');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    console.log('User:', req.user);
    
    const {
      name,
      description,
      price,
      category_id,
      stock_quantity,
      is_amazing_offer
    } = req.body;

    // Log validation data
    console.log('Validation data:', {
      name,
      price,
      category_id,
      stock_quantity,
      is_amazing_offer
    });

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Product name is required' });
    }
    
    if (!price) {
      return res.status(400).json({ message: 'Price is required' });
    }
    
    if (!category_id) {
      return res.status(400).json({ message: 'Category ID is required' });
    }

    // Validate category ID format
    console.log('Validating category ID format:', category_id);
    if (!category_id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Invalid category ID format:', category_id);
      return res.status(400).json({ message: 'Invalid category ID format' });
    }

    // Check if category exists
    console.log('Checking if category exists:', category_id);
    const category = await Category.findById(category_id);
    if (!category) {
      console.log('Category not found:', category_id);
      return res.status(400).json({ message: 'Category not found' });
    }

    // Handle image uploads
    let images = [];
    if (req.files && req.files.length > 0) {
      console.log('Processing uploaded files:', req.files.length);
      images = req.files.map(file => {
        console.log('File processed:', file.filename);
        return `/uploads/${file.filename}`;
      });
    }
    console.log('Images to save:', images);

    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      images,
      category: category_id,
      stockQuantity: parseInt(stock_quantity) || 0,
      isAmazingOffer: is_amazing_offer === 'true'
    });

    console.log('Saving product:', product);
    await product.save();

    // Populate category info
    await product.populate('category', 'name');

    // Format product for frontend compatibility
    const formattedProduct = formatDocument(product);

    console.log('Product created successfully:', formattedProduct);
    res.status(201).json({
      message: 'Product created successfully',
      product: formattedProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      category_id,
      stock_quantity,
      is_amazing_offer,
      is_active
    } = req.body;

    // Validate product ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Validate category ID if provided
    if (category_id && !category_id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    // Check if category exists (if provided)
    if (category_id) {
      const category = await Category.findById(category_id);
      if (!category) {
        return res.status(400).json({ message: 'Category not found' });
      }
    }

    // Build update object
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (category_id) updateData.category = category_id;
    if (stock_quantity !== undefined) updateData.stockQuantity = parseInt(stock_quantity);
    if (is_amazing_offer !== undefined) updateData.isAmazingOffer = is_amazing_offer === 'true';
    if (is_active !== undefined) updateData.isActive = is_active === 'true';

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      updateData.images = newImages;
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Format product for frontend compatibility
    const formattedProduct = formatDocument(product);

    res.json({
      message: 'Product updated successfully',
      product: formattedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate product ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Soft delete - set isActive to false
    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

module.exports = {
  getAllProducts,
  getFeaturedProducts,
  getNewestProducts,
  getBestSellingProducts,
  searchProducts,
  getProductsByCategory,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};