'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const QuizSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  user: { type: String, required: true },
  date: { type: Number, required: true, default: Date.now() }
});

module.exports = mongoose.model('Quiz', QuizSchema);