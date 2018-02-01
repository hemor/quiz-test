'use strict';

const Joi = require('joi');
const { hashPassword } = require('../utils/password');
const User = require('../models/user');


async function getAllUsers(request, h) {
  try {
    let query = User.find();
    query.select('-additional_data');
    let users = await query.exec();
    return h.response({ users })
            .code(200);
  } catch (error) {
    return h.response({ message: 'Unable to get all users' })
            .code(400);
  }
}

async function getUserById(request, h) {
  let { id } = request.params;
  try {
    let query = User.findById(id);
    query.select('-additional_data');
    let user = await query.exec();
    return h.response({ user })
            .code(200);
  } catch (error) {
    return h.response({ message: 'Unable to get user' })
            .code(400);
  }
}

async function deleteUser(request, h) {
  let { id } = request.params;
  try {
    await User.findByIdAndRemove(id);
    return h.response({ message: 'User deleted' })
            .code(200);
  } catch (error) {
    return h.response({ message: 'Unable to ddelete user' })
            .code(400);
  }
}

async function updateUser(request, h) {
  let { id } = request.params;
  let { name, password } = request.payload;
  try {
    let data = {};
    if (name) {
      data.name = name;
    }

    if (password) {
      data['additional_data.password'] = await hashPassword(password);
    }

    let user = await User.findByIdAndUpdate(id, data, { new: true });
    return h.response({ user })
            .code(200);
  } catch (error) {
    return h.response({ message: 'Unable to update user'})
            .code(400);
  }
}


module.exports = [
  {
    method: 'GET',
    path: '/users',
    handler: getAllUsers,
    options: {
      description: 'Get all users',
      tags: ['api']
    }
  },
  {
    method: 'GET',
    path: '/users/{id}',
    handler: getUserById,
    options: {
      description: 'Get user',
      tags: ['api'],
      validate: {
        params: {
          id: Joi.string().alphanum().required().description('Id of the user')
        }
      }
    }
  },
  {
    method: 'DELETE',
    path: '/users/{id}',
    handler: deleteUser,
    options: {
      description: 'Delete user',
      tags: ['api'],
      validate: {
        params: {
          id: Joi.string().alphanum().required().description('Id of the user')
        }
      }
    }
  },
  {
    method: 'PATCH',
    path: '/users/{id}',
    handler: updateUser,
    options: {
      description: 'Update user',
      tags: ['api'],
      validate: {
        params: {
          id: Joi.string().alphanum().required().description('Id of the user')
        },
        payload: {
          name: Joi.string().min(5).description('Display name of the user'),
          password: Joi.string().alphanum().min(6).description('Password of the user')
        }
      }
    }
  }
];