'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OptionSchema = new Schema({
  text: { type: String, required: true },
  isAnswer: { type: Boolean, required: true }
});

const QuestionSchema = new Schema({
  text: { type: String, required: true },
  quiz: { type: String, required: true },
  options: [OptionSchema],
  date: { type: Number, required: true, required: Date.now() }
});

module.exports = mongoose.model('Question', QuestionSchema);