import { Injectable, NotFoundException, ConflictException, Logger, Inject, forwardRef } from '@nestjs/common';
import { User } from '../entity/user.entity';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dto/user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private users: User[] = [];
  private currentId = 1;

  findAll(): UserResponseDto[] {
    this.logger.log('Starting to retrieve all users');
    const result = this.users.map(user => this.toResponseDto(user));
    this.logger.log(`Successfully retrieved ${result.length} users`);
    return result;
  }

  findById(id: string): UserResponseDto {
    this.logger.log(`Starting to retrieve user with ID: ${id}`);
    const user = this.users.find(u => u.id === id);
    
    if (!user) {
      this.logger.error(`User with ID ${id} not found`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    this.logger.log(`Successfully retrieved user with ID: ${id}`);
    return this.toResponseDto(user);
  }

  findByEmail(email: string): UserResponseDto {
    this.logger.log(`Starting to retrieve user with email: ${email}`);
    const user = this.users.find(u => u.email === email);
    
    if (!user) {
      this.logger.error(`User with email ${email} not found`);
      throw new NotFoundException(`User with email ${email} not found`);
    }
    
    this.logger.log(`Successfully retrieved user with email: ${email}`);
    return this.toResponseDto(user);
  }

  create(createUserDto: CreateUserDto): UserResponseDto {
    this.logger.log(`Starting to create user with email: ${createUserDto.email}`);
    
    // Check if email already exists
    const existingUser = this.users.find(u => u.email === createUserDto.email);
    if (existingUser) {
      this.logger.error(`User with email ${createUserDto.email} already exists`);
      throw new ConflictException(`User with email ${createUserDto.email} already exists`);
    }

    const newUser = new User(
      this.currentId.toString(),
      createUserDto.name,
      createUserDto.email,
    );
    
    this.users.push(newUser);
    this.currentId++;
    
    this.logger.log(`Successfully created user with ID: ${newUser.id}`);
    return this.toResponseDto(newUser);
  }

  update(id: string, updateUserDto: UpdateUserDto): UserResponseDto {
    this.logger.log(`Starting to update user with ID: ${id}`);
    
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      this.logger.error(`User with ID ${id} not found for update`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if email already exists for another user
    if (updateUserDto.email) {
      const existingUser = this.users.find(u => u.email === updateUserDto.email && u.id !== id);
      if (existingUser) {
        this.logger.error(`Email ${updateUserDto.email} already exists for another user`);
        throw new ConflictException(`Email ${updateUserDto.email} already exists`);
      }
    }

    const user = this.users[userIndex];
    if (updateUserDto.name) user.name = updateUserDto.name;
    if (updateUserDto.email) user.email = updateUserDto.email;
    user.updatedAt = new Date();

    this.logger.log(`Successfully updated user with ID: ${id}`);
    return this.toResponseDto(user);
  }

  delete(id: string): void {
    this.logger.log(`Starting to delete user with ID: ${id}`);
    
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      this.logger.error(`User with ID ${id} not found for deletion`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.users.splice(userIndex, 1);
    this.logger.log(`Successfully deleted user with ID: ${id}`);
  }

  private toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
