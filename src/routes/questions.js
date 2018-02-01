'use strict';

const Promise = require('bluebird');
const Joi = require('joi');
const Question = require('../models/question');


function validateOptions(options) {
  return new Promise((resolve, reject) => {
    if (options.length < 2 || options.length > 5) {
      return reject({ type: 'option', message: 'There must be at least 2 and at most 5 options'});
    }
    let invalid = 0;
    options.forEach(option => {
      /**
       * Conditions
       * 1. option must be an object
       * 2. option must have text and isAnswer properties
       * 3. isAnswer must be a boolean
       */
      if (typeof option !== 'object' || !option.text || typeof option.isAnswer !== 'boolean') {
        invalid++;
      }
    });

    if (invalid > 0) {
      return reject({ type: 'option', message: `Options include ${invalid} invalid option(s)` });
    }
    
    let answers = options.filter(option => option.isAnswer === true);

    if (answers.length < 1) {
      return reject({ type: 'option', message: 'Question does not have a correct answer' });
    }

    return resolve();
  });
}


async function getQuizQuestions(request, h) {
  let { id } = request.params;
  try {
    let questions = await Question.find({ quiz: id });
    return h.response({ questions })
            .code(200);
  } catch (error) {
    return h.response({ message: 'Unable to get quiz questions' })
            .code(400);
  }
}

async function getQuestionById(request, h) {
  let { id } = request.params;
  try {
    let question = await Question.findById(id);
    return h.response({ question })
            .code(200);
  } catch (error) {
    return h.response({ message: 'Unable to get question'})
            .code(400);
  }
}

async function deleteQuestion(request, h) {
  let { id } = request.params;
  try {
    await Question.findByIdAndRemove(id);
    return h.response({ message: 'Question deleted'})
            .code(200);
  } catch (error) {
    return h.response({ message: 'Unable to delete question' })
            .code(400);
  }
}

async function createQuestion(request, h) {
  let { text, quiz, options } = request.payload;
  try {
    await validateOptions(options);

    let data = {
      text,
      quiz,
      options
    };

    let question = new Question(data);
    await question.save();
    return h.response({ question })
            .code(201);
  } catch (error) {
    var message = error.type && error.type === 'option' ? error.message : 'Unable to create question';
    return h.response({ message })
            .code(400);
  }
}

async function updateQuestion(request, h) {
  let { id } = request.params;
  let { text, options } = request.payload;

  try {
    await validateOptions(options);
    let data = {
      text,
      options
    };

    let question = await Question.findByIdAndUpdate(id, data, { new: true });
    return h.response({ question })
            .code(200);
  } catch (error) {
    var message = error.type && error.type === 'option' ? error.message : 'Unable to update question';
    return h.response({ message })
            .code(400);
  }
}


module.exports = [
  {
    method: 'GET',
    path: '/questions/quiz/{id}',
    handler: getQuizQuestions,
    options: {
      description: 'Get all quiz questions',
      tags: ['api'],
      validate: {
        params: {
          id: Joi.string().alphanum().required().description('Id of the quiz')
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/questions/{id}',
    handler: getQuestionById,
    options: {
      description: 'Get a questiion',
      tags: ['api'],
      validate: {
        params: {
          id: Joi.string().alphanum().required().description('Id of the question')
        }
      }
    }
  },
  {
    method: 'DELETE',
    path: '/questions/{id}',
    handler: deleteQuestion,
    options: {
      description: 'Delete a questiion',
      tags: ['api'],
      validate: {
        params: {
          id: Joi.string().alphanum().required().description('Id of the question')
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/questions',
    handler: createQuestion,
    options: {
      description: 'Create a questiion',
      tags: ['api'],
      validate: {
        payload: {
          text: Joi.string().required().description('Text of the question'),
          quiz: Joi.string().alphanum().required().description('Id of the quiz'),
          options: Joi.any().required().description('Options associated with the question')
        }
      }
    }
  },
  {
    method: 'PATCH',
    path: '/questions/{id}',
    handler: updateQuestion,
    options: {
      description: 'Update a questiion',
      tags: ['api'],
      validate: {
        params: {
          id: Joi.string().alphanum().required().description('Id of the question')
        },
        payload: {
          text: Joi.string().description('Text of the question'),
          quiz: Joi.string().alphanum().description('Id of the quiz'),
          options: Joi.any().description('Options associated with the question')
        }
      }
    }
  }
];