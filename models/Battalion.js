const mongoose = require('mongoose');

const battalionSchema = new mongoose.Schema({
  crate: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crate'
  }],
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name:{
    type: String,
    required: true,
  }
}
);

const Battalion = mongoose.model('Battalion', battalionSchema);

module.exports = Battalion;
