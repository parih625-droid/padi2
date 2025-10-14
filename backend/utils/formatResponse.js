// Utility function to convert MongoDB _id to id for frontend compatibility
const formatDocument = (doc) => {
  if (!doc) return doc;
  
  // Convert Mongoose document to plain object if needed
  let plainDoc = doc.toObject ? doc.toObject() : { ...doc };
  
  // Convert single document
  if (plainDoc._id) {
    // Add id field and remove _id
    plainDoc.id = plainDoc._id.toString();
    delete plainDoc._id;
  }
  
  // Convert timestamps for frontend compatibility
  if (plainDoc.createdAt) {
    plainDoc.created_at = plainDoc.createdAt;
    delete plainDoc.createdAt;
  }
  
  if (plainDoc.updatedAt) {
    plainDoc.updated_at = plainDoc.updatedAt;
    delete plainDoc.updatedAt;
  }
  
  // Handle image field
  if (plainDoc.image) {
    plainDoc.image_url = plainDoc.image;
    delete plainDoc.image;
  }
  
  // For products, map fields to match frontend expectations
  if (plainDoc.hasOwnProperty('stockQuantity')) {
    plainDoc.stock_quantity = plainDoc.stockQuantity;
    delete plainDoc.stockQuantity;
  }
  
  if (plainDoc.hasOwnProperty('isActive')) {
    plainDoc.is_active = plainDoc.isActive;
    delete plainDoc.isActive;
  }
  
  if (plainDoc.hasOwnProperty('isAmazingOffer')) {
    plainDoc.is_amazing_offer = plainDoc.isAmazingOffer;
    delete plainDoc.isAmazingOffer;
  }
  
  // For products, extract category name
  if (plainDoc.category && typeof plainDoc.category === 'object' && plainDoc.category.name) {
    plainDoc.category_name = plainDoc.category.name;
    plainDoc.category_id = plainDoc.category.id || plainDoc.category._id;
  }
  
  // For products, handle images - use the first image as image_url for backward compatibility
  if (Array.isArray(plainDoc.images) && plainDoc.images.length > 0) {
    plainDoc.image_url = plainDoc.images[0];
  }
  
  return plainDoc;
};

// Utility function to convert array of MongoDB documents
const formatDocuments = (docs) => {
  if (!Array.isArray(docs)) return docs;
  
  return docs.map(doc => formatDocument(doc));
};

module.exports = {
  formatDocument,
  formatDocuments
};