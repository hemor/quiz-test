'use strict';

const Promise = require('bluebird');
const Joi = require('joi');
const Attempt = require('../models/attempt');
const server = require('../server');


function markAttempt(quiz, questions, answers) {
  return new Promise((resolve, reject) => {
    // answers contain an object with questionId as key and chosen optionId as value
    let answersKeys = Object.keys(answers);

    if (questions.length < 1) {
      return reject({ type: 'attempt', message: 'No questions for the quiz' });
    }
    if (answersKeys.length < 1 && answers.constructor === Object) {
      return reject({ type: 'attempt', message: 'No answers submitted' });
    }

    let totalGrade = questions.length;
    let userGrade = 0;

    for (const key of answersKeys) {
      let question = questions.find(q => q._id == key && q.quiz === quiz);
      if (!question) {
        // The question the user answered cannot be found among the questions for the quiz
        continue;
      }
      let option = question.options.find(o => o.isAnswer === true && o._id == answers[key]);
      if (option) {
        userGrade++;
      }
    }

    return resolve({ score: userGrade, total: totalGrade });
  });
}

async function attemptQuiz(request, h) {
  let { quiz, user, answers } = request.payload;
  try {
    let request = await server.inject(`/questions/quiz/${quiz}`);
    let grade = await markAttempt(quiz, request.result.questions, answers);
    let data = {
      quiz,
      user,
      grade
    };
    let attempt = new Attempt(data);

    await attempt.save();
    return h.response(attempt)
            .code(201);
  } catch (error) {
    let message = error.type && error.type === 'attempt' ? error.message : 'Unable to attempt quiz';
    return h.response({ message })
            .code(400);
  }
}

async function getQuizAttempts(request, h) {
  let { quiz } = request.params;
  try {
    let attempts = await Attempt.find({ quiz });
    return h.response({ attempts })
            .code(200);
  } catch (error) {
    return h.response({ message: 'Unable to get quiz attempts' })
            .code(400);
  }
}

async function getUserAttempts(request, h) {
  let { user } = request.params;
  try {
    let attempts = await Attempt.find({ user });
    return h.response({ attempts })
            .code(200);
  } catch (error) {
    return h.response({ message: 'Unable to get user attempts' })
            .code(400);
  }
}

async function getUserQuizAttempts(request, h) {
  let { quiz, user } = request.params;
  try {
    let attempts = await Attempt.find({ quiz, user });
    return h.response({ attempts })
            .code(200);
  } catch (error) {
    return h.response({ message: 'Unable to get user quiz attempts' })
            .code(400);
  }
}

async function getAttemptById(request, h) {
  let { id } = request.params;
  try {
    let attempt = await Attempt.findById(id);
    return h.response({ attempt })
            .code(200);
  } catch (error) {
    return h.response({ message: 'Unable to get attempt' })
            .code(400);
  }
}

module.exports = [
  {
    method: 'POST',
    path: '/attempts',
    handler: attemptQuiz,
    options: {
      description: 'Attempt a quiz',
      tags: ['api'],
      validate: {
        payload: {
          quiz: Joi.string().alphanum().required().description('Id of the quiz'),
          user: Joi.string().alphanum().required().description('Id of the user'),
          answers: Joi.any().required().description('Answers to the attempted quiz questions')
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/attempts/quiz/{quiz}',
    handler: getQuizAttempts,
    options: {
      description: 'Get all quiz attempts',
      tags: ['api'],
      validate: {
        params: {
          quiz: Joi.string().alphanum().required().description('Id of the quiz')
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/attempts/user/{user}',
    handler: getUserAttempts,
    options: {
      description: 'Get all user attempts',
      tags: ['api'],
      validate: {
        params: {
          user: Joi.string().alphanum().required().description('Id of the user')
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/attempts/quiz/{quiz}/user/{user}',
    handler: getUserQuizAttempts,
    options: {
      description: 'Get all user attempts for a quiz',
      tags: ['api'],
      validate: {
        params: {
          quiz: Joi.string().alphanum().required().description('Id of the quiz'),
          user: Joi.string().alphanum().required().description('Id of the user')
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/attempts/{id}',
    handler: getAttemptById,
    options: {
      description: 'Get an attempt',
      tags: ['api'],
      validate: {
        params: {
          id: Joi.string().alphanum().required().description('Id of the attempt')
        }
      }
    }
  }
];