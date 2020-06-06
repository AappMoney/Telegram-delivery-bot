const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const {v4: uuidv4} = require('uuid');

const userSchema = new Schema({
  name : {
  type: String
  },
  idTg : {
    type: String
  },
  userLang: {
  type: String
  },
  city : {
      type: String
  },
  phone: {
      type: String
  }
},{
  timestamps: true,
  versionKey: false,
  toJSON: {
  virtuals: true
  },
  toObject: {
  virtuals: true
  }
});

const User = mongoose.model('user', userSchema);

module.exports = User;