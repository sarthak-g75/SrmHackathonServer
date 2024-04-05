const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
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
  password: {
    type: String,
    required: true
  },
  batallions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Battalion',
   
  }],
  email:{
    type: String,
    required:true
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
