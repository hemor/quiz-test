'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AttemptSchema = new Schema({
  quiz: { type: String, required: true },
  user: { type: String, required: true },
  grade: {
    score: { type: Number, required: true },
    total: { type: Number, required: true }
  },
  date: { type: Number, required: true, default: Date.now() }
});


module.exports = mongoose.model('Attempt', AttemptSchema);