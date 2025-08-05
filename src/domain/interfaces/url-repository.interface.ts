import { Url } from '../entity/url.entity';

export interface IUrlRepository {
  create(url: Partial<Url>): Promise<Url>;
  findAll(): Promise<Url[]>;
  findById(id: string): Promise<Url | null>;
  findByShortCode(shortCode: string): Promise<Url | null>;
  findByUserId(userId: string): Promise<Url[]>;
  update(id: string, updateData: Partial<Url>): Promise<Url | null>;
  updateByShortCode(shortCode: string, updateData: Partial<Url>): Promise<Url | null>;
  incrementAccessCountAndUpdate(id: string): Promise<void>;
  deleteByShortCode(shortCode: string): Promise<boolean>;
}