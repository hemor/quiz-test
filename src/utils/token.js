'use strict';

const Promise = require('bluebird');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const options = {
  algorithm: process.env.JWT_ALGORITHM,
  expiresIn: process.env.JWT_EXPIRES_IN
};

function createToken(data) {
  return new Promise((resolve, reject) => {
    jwt.sign(data, process.env.JWT_SECRET, options, (err, token) => {
      if (err) {
        return reject(err);
      }
      return resolve(token);
    });
  });
}

async function validateToken(decoded, request, callback) {
  try {
    let user = await User.findById(decoded.id);
    delete user['additional_data'];
    return callback(null, true, user);
  } catch (error) {
    return callback(error, false, user);
  }
}

module.exports = {
  createToken
};