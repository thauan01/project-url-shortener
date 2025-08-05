import 'reflect-metadata';
import chai from 'chai';
import sinonChai from 'sinon-chai';

// Configure chai to use sinon-chai plugin
chai.use(sinonChai);

// Global configuration for tests
process.env.NODE_ENV = 'test';