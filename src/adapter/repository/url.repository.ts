import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Url } from '../../domain/entity/url.entity';
import { IUrlRepository } from '../../domain/interfaces/url-repository.interface';

@Injectable()
export class UrlRepository implements IUrlRepository {
  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
  ) {}

  async create(url: Partial<Url>): Promise<Url> {
    const newUrl = this.urlRepository.create(url);
    console.log(newUrl);
    return await this.urlRepository.save(newUrl);
  }

  async findAll(): Promise<Url[]> {
    return await this.urlRepository.find({
      where: { deletedAt: null },
      relations: ['user'],
    });
  }

  async findById(id: string): Promise<Url | null> {
    return await this.urlRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['user'],
    });
  }

  async findByShortCode(shortCode: string): Promise<Url | null> {
    return await this.urlRepository.findOne({
      where: { shortCode, deletedAt: null },
      relations: ['user'],
    });
  }

  async findByUserId(userId: string): Promise<Url[]> {
    return await this.urlRepository.find({
      where: { userId, deletedAt: null },
      relations: ['user'],
    });
  }

  async update(id: string, updateData: Partial<Url>): Promise<Url | null> {
    await this.urlRepository.update(id, updateData);
    return await this.findById(id);
  }

  async updateByShortCode(shortCode: string, updateData: Partial<Url>): Promise<Url | null> {
    await this.urlRepository.update({ shortCode }, updateData);
    return await this.findByShortCode(shortCode);
  }

  async incrementAccessCountAndUpdate(id: string): Promise<void> {
    await this.urlRepository.increment({ id, deletedAt: null }, 'accessCount', 1);
    await this.urlRepository.update({ id, deletedAt: null }, { updatedAt: new Date() });
  }

  async deleteByShortCode(shortCode: string): Promise<boolean> {
    const result = await this.urlRepository.update(
      { shortCode },
      { 
        deletedAt: new Date(),
        updatedAt: new Date()
      }
    );
    return result.affected > 0;
  }
}
