'use strict';

const Promise = require('bluebird');
const bcrypt = require('bcrypt');

const salt = parseInt(process.env.SALT_ROUNDS, 10);

function hashPassword(text) {
  return new Promise((resolve, reject) => {
    bcrypt
      .hash(text, salt)
      .then(hash => resolve(hash))
      .catch(err => reject(err));
  });
}

function validatePassword(text, hash) {
  return new Promise((resolve, reject) => {
    bcrypt
      .compare(text, hash)
      .then(isValid => resolve(isValid))
      .catch(err => reject(err));
  });
}

module.exports = {
  hashPassword,
  validatePassword
};