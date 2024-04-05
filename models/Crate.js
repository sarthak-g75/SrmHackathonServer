const mongoose = require('mongoose');

const crateSchema = new mongoose.Schema({
 
  access: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  battalion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Battalion',
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },
  reinforcement: {
    type: Boolean,
    default: false
  },
  name:{
    type: String,
    required : true
  },
  type: {
    type: String,
    required: true
  }
});

const Crate = mongoose.model('Crate', crateSchema);

module.exports = Crate;
