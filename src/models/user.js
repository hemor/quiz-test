'use strict';

const mongoose = require('mongoose');
require('mongoose-type-email');
const Schema = mongoose.Schema;


const UserSchema = new Schema({
  name: { type: String, min: 5, required: true },
  email: { type: mongoose.SchemaTypes.Email, required: true, unique: true },
  profilePicture: { type: String },
  additional_data: {
    password: { type: String, min: 6 },
    facebookId: String
  }
}); 

module.exports = mongoose.model('User', UserSchema);