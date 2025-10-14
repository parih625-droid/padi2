const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  image: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Remove manual index declaration since unique: true already creates an index
// categorySchema.index({ name: 1 }); // This line was causing duplicate index warning

module.exports = mongoose.model('Category', categorySchema);