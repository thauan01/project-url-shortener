import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { expect } from 'chai';
import * as sinon from 'sinon';

import { UrlRepository } from '../../../src/adapter/repository/url.repository';
import { Url } from '../../../src/domain/entity/url.entity';
import { makeFakeUrl, makeFakeUrlWithUser, makeFakeUrlArray } from '../../mocks/url-entity.factory';
import { MockRepository, createMockRepository, createUpdateResult } from '../../mocks/typeorm-repository.helper';

describe(UrlRepository.name, () => {
  let sut: UrlRepository;
  let mockRepository: MockRepository<Url>;

  beforeEach(async () => {
    mockRepository = createMockRepository<Url>();

    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        UrlRepository,
        {
          provide: getRepositoryToken(Url),
          useValue: mockRepository,
        },
      ],
    }).compile();

    sut = testingModule.get<UrlRepository>(UrlRepository);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Should be defined', () => {
    expect(sut).to.not.be.undefined;
    expect(mockRepository).to.not.be.undefined;
  });

  describe('create', () => {
    it('Should create and save a new URL successfully', async () => {
      // Arrange
      const urlData: Partial<Url> = {
        originalUrl: 'https://www.example.com',
        shortCode: 'abc123',
        userId: 'user-123'
      };
      const fakeUrl = makeFakeUrl(urlData);
      
      mockRepository.create.returns(fakeUrl);
      mockRepository.save.resolves(fakeUrl);

      // Act
      const result = await sut.create(urlData);

      // Assert
      expect(mockRepository.create.calledOnce).to.be.true;
      expect(mockRepository.create.calledWith(urlData)).to.be.true;
      expect(mockRepository.save.calledOnce).to.be.true;
      expect(mockRepository.save.calledWith(fakeUrl)).to.be.true;
      expect(result).to.deep.equal(fakeUrl);
    });

    it('Should handle repository errors when creating URL', async () => {
      // Arrange
      const urlData: Partial<Url> = { originalUrl: 'https://www.example.com' };
      const error = new Error('Database connection failed');
      
      mockRepository.create.returns({});
      mockRepository.save.rejects(error);

      // Act & Assert
      try {
        await sut.create(urlData);
        expect.fail('Should have thrown an error');
      } catch (thrownError) {
        expect(thrownError).to.equal(error);
      }
    });
  });

  describe('findAll', () => {
    it('Should return all URLs with user relations successfully', async () => {
      // Arrange
      const fakeUrls = makeFakeUrlArray(3);
      mockRepository.find.resolves(fakeUrls);

      // Act
      const result = await sut.findAll();

      // Assert
      expect(mockRepository.find.calledOnce).to.be.true;
      expect(mockRepository.find.calledWith({
        where: { deletedAt: null },
        relations: ['user'],
      })).to.be.true;
      expect(result).to.deep.equal(fakeUrls);
    });

    it('Should return empty array when no URLs found', async () => {
      // Arrange
      mockRepository.find.resolves([]);

      // Act
      const result = await sut.findAll();

      // Assert
      expect(result).to.be.an('array');
      expect(result).to.have.length(0);
    });

    it('Should handle repository errors when finding all URLs', async () => {
      // Arrange
      const error = new Error('Database query failed');
      mockRepository.find.rejects(error);

      // Act & Assert
      try {
        await sut.findAll();
        expect.fail('Should have thrown an error');
      } catch (thrownError) {
        expect(thrownError).to.equal(error);
      }
    });
  });

  describe('findById', () => {
    it('Should return URL when found by ID', async () => {
      // Arrange
      const id = 'test-url-id-123';
      const fakeUrl = makeFakeUrlWithUser();
      mockRepository.findOne.resolves(fakeUrl);

      // Act
      const result = await sut.findById(id);

      // Assert
      expect(mockRepository.findOne.calledOnce).to.be.true;
      expect(mockRepository.findOne.calledWith({
        where: { id, deletedAt: null },
        relations: ['user'],
      })).to.be.true;
      expect(result).to.deep.equal(fakeUrl);
    });

    it('Should return null when URL not found by ID', async () => {
      // Arrange
      const id = 'non-existing-id';
      mockRepository.findOne.resolves(null);

      // Act
      const result = await sut.findById(id);

      // Assert
      expect(result).to.be.null;
    });

    it('Should handle repository errors when finding URL by ID', async () => {
      // Arrange
      const id = 'test-id';
      const error = new Error('Database connection lost');
      mockRepository.findOne.rejects(error);

      // Act & Assert
      try {
        await sut.findById(id);
        expect.fail('Should have thrown an error');
      } catch (thrownError) {
        expect(thrownError).to.equal(error);
      }
    });
  });

  describe('findByShortCode', () => {
    it('Should return URL when found by short code', async () => {
      // Arrange
      const shortCode = 'abc123';
      const fakeUrl = makeFakeUrlWithUser({}, { shortCode });
      mockRepository.findOne.resolves(fakeUrl);

      // Act
      const result = await sut.findByShortCode(shortCode);

      // Assert
      expect(mockRepository.findOne.calledOnce).to.be.true;
      expect(mockRepository.findOne.calledWith({
        where: { shortCode, deletedAt: null },
        relations: ['user'],
      })).to.be.true;
      expect(result).to.deep.equal(fakeUrl);
    });

    it('Should return null when URL not found by short code', async () => {
      // Arrange
      const shortCode = 'nonexistent';
      mockRepository.findOne.resolves(null);

      // Act
      const result = await sut.findByShortCode(shortCode);

      // Assert
      expect(result).to.be.null;
    });

    it('Should handle repository errors when finding URL by short code', async () => {
      // Arrange
      const shortCode = 'abc123';
      const error = new Error('Query timeout');
      mockRepository.findOne.rejects(error);

      // Act & Assert
      try {
        await sut.findByShortCode(shortCode);
        expect.fail('Should have thrown an error');
      } catch (thrownError) {
        expect(thrownError).to.equal(error);
      }
    });
  });

  describe('findByUserId', () => {
    it('Should return URLs when found by user ID', async () => {
      // Arrange
      const userId = 'user-123';
      const fakeUrls = makeFakeUrlArray(2, [{ userId }, { userId }]);
      mockRepository.find.resolves(fakeUrls);

      // Act
      const result = await sut.findByUserId(userId);

      // Assert
      expect(mockRepository.find.calledOnce).to.be.true;
      expect(mockRepository.find.calledWith({
        where: { userId, deletedAt: null },
        relations: ['user'],
      })).to.be.true;
      expect(result).to.deep.equal(fakeUrls);
    });

    it('Should return empty array when no URLs found for user', async () => {
      // Arrange
      const userId = 'user-without-urls';
      mockRepository.find.resolves([]);

      // Act
      const result = await sut.findByUserId(userId);

      // Assert
      expect(result).to.be.an('array');
      expect(result).to.have.length(0);
    });

    it('Should handle repository errors when finding URLs by user ID', async () => {
      // Arrange
      const userId = 'user-123';
      const error = new Error('Connection timeout');
      mockRepository.find.rejects(error);

      // Act & Assert
      try {
        await sut.findByUserId(userId);
        expect.fail('Should have thrown an error');
      } catch (thrownError) {
        expect(thrownError).to.equal(error);
      }
    });
  });

  describe('update', () => {
    it('Should update URL and return updated URL successfully', async () => {
      // Arrange
      const id = 'test-url-id-123';
      const updateData: Partial<Url> = { originalUrl: 'https://www.updated-example.com' };
      const updatedUrl = makeFakeUrl({ id, ...updateData });
      
      mockRepository.update.resolves(createUpdateResult(1));
      
      // Mock findById method call inside update method
      const findByIdStub = sinon.stub(sut, 'findById').resolves(updatedUrl);

      // Act
      const result = await sut.update(id, updateData);

      // Assert
      expect(mockRepository.update.calledOnce).to.be.true;
      expect(mockRepository.update.calledWith(id, updateData)).to.be.true;
      expect(findByIdStub.calledOnce).to.be.true;
      expect(findByIdStub.calledWith(id)).to.be.true;
      expect(result).to.deep.equal(updatedUrl);
    });

    it('Should return null when URL to update is not found', async () => {
      // Arrange
      const id = 'non-existing-id';
      const updateData: Partial<Url> = { originalUrl: 'https://www.example.com' };
      
      mockRepository.update.resolves(createUpdateResult(1));
      const findByIdStub = sinon.stub(sut, 'findById').resolves(null);

      // Act
      const result = await sut.update(id, updateData);

      // Assert
      expect(result).to.be.null;
    });

    it('Should handle repository errors when updating URL', async () => {
      // Arrange
      const id = 'test-id';
      const updateData: Partial<Url> = { originalUrl: 'https://www.example.com' };
      const error = new Error('Update failed');
      
      mockRepository.update.rejects(error);

      // Act & Assert
      try {
        await sut.update(id, updateData);
        expect.fail('Should have thrown an error');
      } catch (thrownError) {
        expect(thrownError).to.equal(error);
      }
    });
  });

  describe('updateByShortCode', () => {
    it('Should update URL by short code and return updated URL successfully', async () => {
      // Arrange
      const shortCode = 'abc123';
      const updateData: Partial<Url> = { originalUrl: 'https://www.updated-example.com' };
      const updatedUrl = makeFakeUrl({ shortCode, ...updateData });
      
      mockRepository.update.resolves(createUpdateResult(1));
      const findByShortCodeStub = sinon.stub(sut, 'findByShortCode').resolves(updatedUrl);

      // Act
      const result = await sut.updateByShortCode(shortCode, updateData);

      // Assert
      expect(mockRepository.update.calledOnce).to.be.true;
      expect(mockRepository.update.calledWith({ shortCode }, updateData)).to.be.true;
      expect(findByShortCodeStub.calledOnce).to.be.true;
      expect(findByShortCodeStub.calledWith(shortCode)).to.be.true;
      expect(result).to.deep.equal(updatedUrl);
    });

    it('Should return null when URL to update by short code is not found', async () => {
      // Arrange
      const shortCode = 'nonexistent';
      const updateData: Partial<Url> = { originalUrl: 'https://www.example.com' };
      
      mockRepository.update.resolves(createUpdateResult(1));
      const findByShortCodeStub = sinon.stub(sut, 'findByShortCode').resolves(null);

      // Act
      const result = await sut.updateByShortCode(shortCode, updateData);

      // Assert
      expect(result).to.be.null;
    });

    it('Should handle repository errors when updating URL by short code', async () => {
      // Arrange
      const shortCode = 'abc123';
      const updateData: Partial<Url> = { originalUrl: 'https://www.example.com' };
      const error = new Error('Update by short code failed');
      
      mockRepository.update.rejects(error);

      // Act & Assert
      try {
        await sut.updateByShortCode(shortCode, updateData);
        expect.fail('Should have thrown an error');
      } catch (thrownError) {
        expect(thrownError).to.equal(error);
      }
    });
  });

  describe('incrementAccessCountAndUpdate', () => {
    it('Should increment access count and update timestamp successfully', async () => {
      // Arrange
      const id = 'test-url-id-123';
      
      mockRepository.increment.resolves(createUpdateResult(1));
      mockRepository.update.resolves(createUpdateResult(1));

      // Act
      await sut.incrementAccessCountAndUpdate(id);

      // Assert
      expect(mockRepository.increment.calledOnce).to.be.true;
      expect(mockRepository.increment.calledWith(
        { id, deletedAt: null },
        'accessCount',
        1
      )).to.be.true;
      
      expect(mockRepository.update.calledOnce).to.be.true;
      expect(mockRepository.update.getCall(0).args[0]).to.deep.equal({ id, deletedAt: null });
      expect(mockRepository.update.getCall(0).args[1]).to.have.property('updatedAt');
      expect(mockRepository.update.getCall(0).args[1].updatedAt).to.be.instanceOf(Date);
    });

    it('Should handle repository errors when incrementing access count', async () => {
      // Arrange
      const id = 'test-id';
      const error = new Error('Increment failed');
      
      mockRepository.increment.rejects(error);

      // Act & Assert
      try {
        await sut.incrementAccessCountAndUpdate(id);
        expect.fail('Should have thrown an error');
      } catch (thrownError) {
        expect(thrownError).to.equal(error);
      }
    });

    it('Should handle repository errors when updating timestamp after increment', async () => {
      // Arrange
      const id = 'test-id';
      const error = new Error('Update timestamp failed');
      
      mockRepository.increment.resolves(createUpdateResult(1));
      mockRepository.update.rejects(error);

      // Act & Assert
      try {
        await sut.incrementAccessCountAndUpdate(id);
        expect.fail('Should have thrown an error');
      } catch (thrownError) {
        expect(thrownError).to.equal(error);
      }
    });
  });

  describe('deleteByShortCode', () => {
    it('Should soft delete URL by short code successfully and return true', async () => {
      // Arrange
      const shortCode = 'abc123';
      const updateResult = createUpdateResult(1);
      
      mockRepository.update.resolves(updateResult);

      // Act
      const result = await sut.deleteByShortCode(shortCode);

      // Assert
      expect(mockRepository.update.calledOnce).to.be.true;
      
      const updateCall = mockRepository.update.getCall(0);
      expect(updateCall.args[0]).to.deep.equal({ shortCode });
      expect(updateCall.args[1]).to.have.property('deletedAt');
      expect(updateCall.args[1]).to.have.property('updatedAt');
      expect(updateCall.args[1].deletedAt).to.be.instanceOf(Date);
      expect(updateCall.args[1].updatedAt).to.be.instanceOf(Date);
      
      expect(result).to.be.true;
    });

    it('Should return false when no URL is affected by soft delete', async () => {
      // Arrange
      const shortCode = 'nonexistent';
      const updateResult = createUpdateResult(0);
      
      mockRepository.update.resolves(updateResult);

      // Act
      const result = await sut.deleteByShortCode(shortCode);

      // Assert
      expect(result).to.be.false;
    });

    it('Should handle repository errors when soft deleting URL by short code', async () => {
      // Arrange
      const shortCode = 'abc123';
      const error = new Error('Soft delete failed');
      
      mockRepository.update.rejects(error);

      // Act & Assert
      try {
        await sut.deleteByShortCode(shortCode);
        expect.fail('Should have thrown an error');
      } catch (thrownError) {
        expect(thrownError).to.equal(error);
      }
    });
  });
});
