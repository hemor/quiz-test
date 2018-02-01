'use strict';

const Joi = require('joi');
const { hashPassword, validatePassword } = require('../utils/password');
const { createToken } = require('../utils/token');
const User = require('../models/user');

async function register(request, h) {
  let { name, email, password } = request.payload;
  
  try {
    password = await hashPassword(password);
    let data = {
      name,
      email,
      additional_data: {
        password
      }
    };

    let user = new User(data);

    await user.save();

    let tokenData = {
      id: user._id,
      scope: ['user']
    };

    let token = await createToken(tokenData);
    let response = {
      _id: user._id,
      name: user.name,
      email: user.email,
      token
    };
    return h.response({ user: response })
            .code(201);
  } catch (error) {
    return h.response({ message: 'Unable to register user' })
            .code(400);
  }
}

async function login(request, h) {
  let { email, password } = request.payload;

  try {
    let user = await User.findOne({ email });
    let isValidPassword = await validatePassword(password, user.additional_data.password);

    if (!isValidPassword) {
      return h.response({ message: 'Invalid email and/or password'})
              .code(400);
    }

    let tokenData = {
      id: user._id,
      scope: ['user']
    };

    let token = await createToken(tokenData);
    let response = {
      _id: user._id,
      name: user.name,
      email: user.email,
      token
    };
    return h.response({ user: response })
            .code(200);
  } catch (error) {
    return h.response({ message: 'Invalid email and/or password'})
              .code(400);
  }
}


module.exports = [
  {
    method: 'POST',
    path: '/auth/register',
    handler: register,
    options: {
      description: 'Create a user',
      notes: 'Returns a jwt token along with the user details if signup is successful',
      tags: ['api'],
      validate: {
        payload: {
          name: Joi.string().min(5).required().description('Display name of the user'),
          email: Joi.string().email().required().description('Email address of the user'),
          password: Joi.string().alphanum().min(6).required().description('Password of the user')
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/auth/login',
    handler: login,
    options: {
      description: 'Login a user',
      notes: 'Returns a jwt token along with the user details if signin is successful',
      tags: ['api'],
      validate: {
        payload: {
          email: Joi.string().email().required().description('Email address of the user'),
          password: Joi.string().alphanum().min(6).required().description('Password of the user')
        }
      }
    }
  }
];