import { User } from '../entity/user.entity';

export interface IUserRepository {
  create(user: Partial<User>): Promise<User>;
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, updateData: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}