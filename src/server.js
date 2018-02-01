'use strict';

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const Hapi = require('hapi');
const Promise = require('bluebird');
const mongoose = require('mongoose');
const Package = require('../package');
const { validateToken } = require('./utils/token');


const routesPath = path.join(__dirname, 'routes');
const swaggerOptions = {
  info: {
    title: 'Quiz Test Documentation',
    version: Package.version,
    description: Package.description,
    contact: {
      name: 'Emmanuel Akinpelu',
      url: 'https://twitter.com/emmy_rald'
    }
  }
};

const server = new Hapi.Server({
  port: process.env.PORT
});

mongoose.Promise = Promise;

async function initDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true });
    console.log('Connected to database server.');
  }
  catch (error) {
    console.log(error.message);
    process.exit(1);
  }
}

async function init() {
  try {
    // Initialize database
    await initDb();

    // Register plugins
    await server.register([
      require('inert'),
      require('vision'),
      {
        plugin: require('hapi-swagger'),
        options: swaggerOptions
      }
    ]);

    // Register static files routes
    server.route({
      method: 'GET',
      path: '/profile-pictures/{file*}',
      handler: {
        directory: {
          path: path.join(__dirname, '../pictures'),
          index: false
        }
      }
    });

    // Register routes
    fs.readdirSync(routesPath)
      .filter(file => (fs.lstatSync(path.resolve(routesPath, file)).isFile()) && (file.indexOf('.') !== 0) && (file.slice(-3) === '.js'))
      .forEach(file => {
        const route = require(path.join(routesPath, file));
        server.route(route);
      });

    // Start server
    await server.start();
    console.log(`Server running at ${server.info.uri}`);
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
}

init();

module.exports = server;