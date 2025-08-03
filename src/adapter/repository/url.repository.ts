import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Url } from '../../domain/entity/url.entity';

@Injectable()
export class UrlRepository {
  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
  ) {}

  async create(url: Partial<Url>): Promise<Url> {
    const newUrl = this.urlRepository.create(url);
    return await this.urlRepository.save(newUrl);
  }

  async findAll(): Promise<Url[]> {
    return await this.urlRepository.find({
      relations: ['user'],
    });
  }

  async findById(id: string): Promise<Url | null> {
    return await this.urlRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findByShortCode(shortCode: string): Promise<Url | null> {
    return await this.urlRepository.findOne({
      where: { shortCode },
      relations: ['user'],
    });
  }

  async findByUserId(userId: string): Promise<Url[]> {
    return await this.urlRepository.find({
      where: { userId },
      relations: ['user'],
    });
  }

  async update(id: string, updateData: Partial<Url>): Promise<Url | null> {
    await this.urlRepository.update(id, updateData);
    return await this.findById(id);
  }

  async incrementAccessCount(id: string): Promise<void> {
    await this.urlRepository.increment({ id }, 'accessCount', 1);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.urlRepository.delete(id);
    return result.affected > 0;
  }
}
