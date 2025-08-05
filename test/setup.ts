import 'reflect-metadata';

const chai = require('chai');
const sinonChai = require('sinon-chai');

// Configure chai to use sinon-chai plugin
chai.use(sinonChai);

// Global configuration for tests
process.env.NODE_ENV = 'test';
