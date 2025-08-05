import { Repository, UpdateResult, FindOneOptions } from 'typeorm';
import * as sinon from 'sinon';

export type MockRepository<T = any> = Partial<Record<keyof Repository<T>, sinon.SinonStub>>;

export const createMockRepository = <T = any>(): MockRepository<T> => {
  return {
    create: sinon.stub(),
    save: sinon.stub(),
    find: sinon.stub(),
    findOne: sinon.stub(),
    update: sinon.stub(),
    delete: sinon.stub(),
    increment: sinon.stub(),
  };
};

export const createUpdateResult = (affected: number = 1): UpdateResult => {
  return {
    affected,
    generatedMaps: [],
    raw: {},
  };
};
