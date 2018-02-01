'use strict';

const Joi = require('joi');
const Quiz = require('../models/quiz');


async function getAllQuizzes(request, h) {
  try {
    let quizzes = await Quiz.find({});
    return h.response({ quizzes })
            .code(200);
  } catch (error) {
    return h.response({ message: 'Unable to get all quizzes' })
            .code(400);
  }
}

async function createQuiz(request, h) {
  let { name, description, user } = request.payload;
  let data = {
    name,
    description,
    user
  };

  let quiz = new Quiz(data);

  try {
    await quiz.save();
    return h.response({ quiz })
            .code(201);
  } catch (error) {
    return h.response({ message: 'Unable to create quiz' })
            .code(400);
  }
}

async function getQuizById(request, h) {
  let { id } = request.params;
  try {
    let quiz = await Quiz.findById(id);
    return h.response({ quiz })
            .code(200);
  } catch (error) {
    return h.response({ message: 'Unable to get quiz' })
            .code(400);
  }
}

async function updateQuiz(request, h) {
  let { id } = request.params;
  let { name, description } = request.payload;
  let data = {
    name,
    description
  };

  try {
    let quiz = await Quiz.findByIdAndUpdate(id, data, { new: true });
    return h.response({ quiz })
            .code(200);
  } catch (error) {
    return h.response({ message: 'Unable to update quiz'})
            .code(400);
  }
}

async function deleteQuiz(request, h) {
  let { id } = request.params;

  try {
    await Quiz.findByIdAndRemove(id);
    return h.response({ message: 'Quiz deleted'})
            .code(200);
  } catch (error) {
    return h.response({ message: 'Unable to delete quiz' })
            .code(400);
  }
}

module.exports = [
  {
    method: 'GET',
    path: '/quizzes',
    handler: getAllQuizzes,
    options: {
      description: 'Get all quizzes',
      tags: ['api']
    }
  },
  {
    method: 'POST',
    path: '/quizzes',
    handler: createQuiz,
    options: {
      description: 'Create a quiz',
      tags: ['api'],
      validate: {
        payload: {
          name: Joi.string().required().description('Short name of the quiz'),
          description: Joi.string().description('Optional detailed description of the quiz'),
          user: Joi.string().required().description('User id of the creator of the quiz')
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/quizzes/{id}',
    handler: getQuizById,
    options: {
      description: 'Get a quiz',
      tags: ['api'],
      validate: {
        params: {
          id: Joi.string().alphanum().required().description('Id of the quiz')
        }
      }
    }
  },
  {
    method: 'PATCH',
    path: '/quizzes/{id}',
    handler: updateQuiz,
    options: {
      description: 'Update a quiz',
      tags: ['api'],
      validate: {
        params: {
          id: Joi.string().alphanum().required().description('Id of the quiz')
        },
        payload: {
          name: Joi.string().description('Short name of the quiz'),
          description: Joi.string().description('Optional detailed description of the quiz')
        }
      }
    }
  },
  {
    method: 'DELETE',
    path: '/quizzes/{id}',
    handler: deleteQuiz,
    options: {
      description: 'Delete a quiz',
      tags: ['api'],
      validate: {
        params: {
          id: Joi.string().alphanum().required().description('Id of the quiz')
        }
      }
    }
  }
];