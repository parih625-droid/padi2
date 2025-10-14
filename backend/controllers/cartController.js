const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { formatCartData } = require('../utils/cartFormatter');

const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
      await cart.save();
    }

    // Always populate product details
    await cart.populate('items.product', 'name price images stockQuantity');

    // Format cart data for frontend compatibility
    const formattedCart = formatCartData(cart);
    
    res.json({ cart: formattedCart });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
};

const addToCart = async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    // Validate product ID
    if (!product_id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Check if product exists and is active
    const product = await Product.findOne({ _id: product_id, isActive: true });
    if (!product) {
      return res.status(404).json({ message: 'Product not found or not available' });
    }

    // Check stock
    if (product.stockQuantity < quantity) {
      return res.status(400).json({ 
        message: `Only ${product.stockQuantity} items available in stock` 
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === product_id
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += parseInt(quantity);
    } else {
      // Add new item
      cart.items.push({
        product: product_id,
        quantity: parseInt(quantity)
      });
    }

    await cart.save();
    
    // Populate product details
    await cart.populate('items.product', 'name price images stockQuantity');

    // Format cart data for frontend compatibility
    const formattedCart = formatCartData(cart);
    
    res.json({
      message: 'Item added to cart successfully',
      cart: formattedCart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Failed to add item to cart' });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;

    // Validate product ID
    if (!product_id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Validate quantity
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Find item index
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === product_id
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (qty === 0) {
      // Remove item from cart
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      // Check product stock
      const product = await Product.findById(product_id);
      if (product && product.stockQuantity < qty) {
        return res.status(400).json({ 
          message: `Only ${product.stockQuantity} items available in stock` 
        });
      }
      cart.items[itemIndex].quantity = qty;
    }

    await cart.save();
    
    // Populate product details
    await cart.populate('items.product', 'name price images stockQuantity');

    // Format cart data for frontend compatibility
    const formattedCart = formatCartData(cart);
    
    res.json({
      message: 'Cart updated successfully',
      cart: formattedCart
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Failed to update cart' });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { product_id } = req.params;

    // Validate product ID
    if (!product_id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Remove item from cart
    cart.items = cart.items.filter(
      item => item.product.toString() !== product_id
    );

    await cart.save();
    
    // Populate product details
    await cart.populate('items.product', 'name price images stockQuantity');

    // Format cart data for frontend compatibility
    const formattedCart = formatCartData(cart);
    
    res.json({
      message: 'Item removed from cart successfully',
      cart: formattedCart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Failed to remove item from cart' });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    // Format cart data for frontend compatibility (empty cart)
    const formattedCart = formatCartData(cart);
    
    res.json({
      message: 'Cart cleared successfully',
      cart: formattedCart
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Failed to clear cart' });
  }
};

const validateCartItems = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name stockQuantity isActive');

    if (!cart) {
      return res.json({ valid: true, issues: [] });
    }

    const issues = [];
    for (const item of cart.items) {
      const product = item.product;
      if (!product) {
        issues.push(`Product not found`);
      } else if (!product.isActive) {
        issues.push(`${product.name} is no longer available`);
      } else if (item.quantity > product.stockQuantity) {
        issues.push(`${product.name} - only ${product.stockQuantity} available, you have ${item.quantity} in cart`);
      }
    }

    res.json({
      valid: issues.length === 0,
      issues
    });
  } catch (error) {
    console.error('Validate cart error:', error);
    res.status(500).json({ message: 'Failed to validate cart' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  validateCartItems
};