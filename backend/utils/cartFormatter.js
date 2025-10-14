const { formatDocument } = require('./formatResponse');

// Utility function to format cart data for frontend compatibility
const formatCartData = (cartDoc) => {
  if (!cartDoc) return { items: [], summary: { item_count: 0, total_price: 0 } };
  
  // Convert Mongoose document to plain object if needed
  const cart = cartDoc.toObject ? cartDoc.toObject() : { ...cartDoc };
  
  // Format items for frontend
  const items = (cart.items || []).map(item => {
    // Handle product data - it could be a populated object or just an ID
    let product = {};
    if (item.product && typeof item.product === 'object') {
      // Product is populated, format it properly using formatDocument
      product = formatDocument(item.product);
    } else if (item.product) {
      // Product is just an ID, create a minimal product object
      product = {
        _id: item.product,
        id: item.product.toString(),
        name: 'نامشخص',
        price: 0,
        images: []
      };
    }
    
    // Extract product fields with fallbacks
    const productId = (product._id ? product._id.toString() : product.id) || item.product || 'unknown';
    const productName = product.name || 'بدون نام';
    const productPrice = parseFloat(product.price) || 0;
    
    // Handle image - should be in image_url after formatDocument
    let productImage = '';
    if (product.image_url) {
      // This is the formatted field from formatDocument
      productImage = product.image_url;
    } else if (Array.isArray(product.images) && product.images.length > 0) {
      // Fallback to raw images array
      productImage = product.images[0];
    } else if (product.image) {
      productImage = product.image;
    }
    
    // Handle stock quantity - could be in stockQuantity or stock_quantity
    const productStock = parseInt(product.stockQuantity || product.stock_quantity) || 0;
    
    // Handle quantity - could be missing
    const itemQuantity = parseInt(item.quantity) || 1;
    
    return {
      product_id: productId,
      name: productName,
      price: productPrice,
      image_url: productImage,
      stock_quantity: productStock,
      quantity: itemQuantity,
      description: product.description || ''
    };
  });
  
  // Calculate summary with proper error handling
  const itemCount = items.reduce((total, item) => total + (parseInt(item.quantity) || 0), 0);
  const totalPrice = items.reduce((total, item) => {
    const price = parseFloat(item.price) || 0;
    const qty = parseInt(item.quantity) || 0;
    return total + (price * qty);
  }, 0);
  
  return {
    items,
    summary: {
      item_count: itemCount,
      total_price: parseFloat(totalPrice.toFixed(2))
    }
  };
};

module.exports = { formatCartData };