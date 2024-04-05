const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['admin', 'user'], 
    required: true
  },
  name: {
    type: String,
    required: true
  },
  crates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crate'
  }],
  battalion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Battalion',
    required: true
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
