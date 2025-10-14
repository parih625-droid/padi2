const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const createOrder = async (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      customer_address,
      notes,
      payment_method
    } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price stockQuantity');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate cart items
    const issues = [];
    let totalPrice = 0;

    for (const item of cart.items) {
      const product = item.product;
      if (!product) {
        issues.push(`Product not found`);
      } else if (!product.isActive) {
        issues.push(`${product.name} is no longer available`);
      } else if (item.quantity > product.stockQuantity) {
        issues.push(`${product.name} - only ${product.stockQuantity} available, you have ${item.quantity} in cart`);
      } else {
        totalPrice += product.price * item.quantity;
      }
    }

    if (issues.length > 0) {
      return res.status(400).json({ 
        message: 'Cart validation failed',
        issues 
      });
    }

    // Create order items
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price
    }));

    // Create order
    const order = new Order({
      user: req.user._id,
      customerName: customer_name,
      customerPhone: customer_phone,
      customerAddress: customer_address,
      notes,
      items: orderItems,
      totalPrice,
      paymentMethod: payment_method
    });

    await order.save();

    // Update product stock quantities
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stockQuantity: -item.quantity, salesCount: item.quantity } }
      );
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    // Populate order details
    await order.populate([
      { path: 'user', select: 'name email' },
      { path: 'items.product', select: 'name price images' }
    ]);

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = parseInt(req.query.offset) || 0;

    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate('items.product', 'name price images');

    res.json({ orders });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate order ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const order = await Order.findById(id)
      .populate('user', 'name email')
      .populate('items.product', 'name price images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to view this order
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate('user', 'name email')
      .populate('items.product', 'name');

    res.json({ orders });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate order ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate order ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    // Only allow deletion of pending orders
    const order = await Order.findOne({ 
      _id: id, 
      status: 'pending' 
    });

    if (!order) {
      return res.status(400).json({ 
        message: 'Order not found or cannot be deleted (only pending orders can be deleted)' 
      });
    }

    await Order.findByIdAndDelete(id);

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ message: 'Failed to delete order' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name');

    res.json({
      totalOrders,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      pendingOrders,
      recentOrders
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};

const initializePayment = async (req, res) => {
  try {
    const { orderId, gateway } = req.body;

    // Validate order ID
    if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to pay for this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Here you would integrate with actual payment gateways
    // For now, we'll just return a mock response
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Update order with payment info
    order.paymentStatus = 'pending';
    order.transactionId = transactionId;
    await order.save();

    res.json({
      message: 'Payment initialized',
      transactionId,
      amount: order.totalPrice,
      orderId: order._id
    });
  } catch (error) {
    console.error('Initialize payment error:', error);
    res.status(500).json({ message: 'Failed to initialize payment' });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { transactionId } = req.query;

    if (!transactionId) {
      return res.status(400).json({ message: 'Transaction ID is required' });
    }

    const order = await Order.findOne({ transactionId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Here you would verify with the actual payment gateway
    // For now, we'll just simulate a successful payment
    order.paymentStatus = 'completed';
    order.status = 'processing';
    await order.save();

    res.json({
      message: 'Payment verified successfully',
      order
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Failed to verify payment' });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getDashboardStats,
  initializePayment,
  verifyPayment
};