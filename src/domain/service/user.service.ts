import { Injectable, NotFoundException, ConflictException, Logger, Inject, forwardRef } from '@nestjs/common';
import { User } from '../entity/user.entity';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dto/user.dto';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { DI_USER_REPOSITORY } from '../../configs/container-names';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @Inject(DI_USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async findAll(): Promise<UserResponseDto[]> {
    this.logger.log('Starting to retrieve all users');
    const users = await this.userRepository.findAll();
    const result = users.map(user => this.toResponseDto(user));
    this.logger.log(`Successfully retrieved ${result.length} users`);
    return result;
  }

  async findById(id: string): Promise<UserResponseDto> {
    this.logger.log(`Starting to retrieve user with ID: ${id}`);
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      this.logger.error(`User with ID ${id} not found`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    this.logger.log(`Successfully retrieved user with ID: ${id}`);
    return this.toResponseDto(user);
  }

  async findByEmail(email: string): Promise<UserResponseDto> {
    this.logger.log(`Starting to retrieve user with email: ${email}`);
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      this.logger.error(`User with email ${email} not found`);
      throw new NotFoundException(`User with email ${email} not found`);
    }
    
    this.logger.log(`Successfully retrieved user with email: ${email}`);
    return this.toResponseDto(user);
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    this.logger.log(`Starting to create user with email: ${createUserDto.email}`);
    
    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      this.logger.error(`User with email ${createUserDto.email} already exists`);
      throw new ConflictException(`User with email ${createUserDto.email} already exists`);
    }

    const userData = {
      name: createUserDto.name,
      email: createUserDto.email,
      password: createUserDto.password, // Consider hashing the password
    };
    
    const newUser = await this.userRepository.create(userData);
    
    this.logger.log(`Successfully created user with ID: ${newUser.id}`);
    return this.toResponseDto(newUser);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    this.logger.log(`Starting to update user with ID: ${id}`);
    
    // Check if user exists
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      this.logger.error(`User with ID ${id} not found for update`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if email already exists for another user
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const userWithEmail = await this.userRepository.findByEmail(updateUserDto.email);
      if (userWithEmail && userWithEmail.id !== id) {
        this.logger.error(`Email ${updateUserDto.email} already exists for another user`);
        throw new ConflictException(`Email ${updateUserDto.email} already exists`);
      }
    }

    const updateData: Partial<User> = {};
    if (updateUserDto.name) updateData.name = updateUserDto.name;
    if (updateUserDto.email) updateData.email = updateUserDto.email;
    updateData.updatedAt = new Date();

    const updatedUser = await this.userRepository.update(id, updateData);
    
    if (!updatedUser) {
      this.logger.error(`Failed to update user with ID: ${id}`);
      throw new NotFoundException(`User with ID ${id} could not be updated`);
    }
    
    this.logger.log(`Successfully updated user with ID: ${id}`);
    return this.toResponseDto(updatedUser);
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Starting to delete user with ID: ${id}`);
    
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      this.logger.error(`User with ID ${id} not found for deletion`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const deleteResult = await this.userRepository.delete(id);
    
    if (!deleteResult) {
      this.logger.error(`Failed to delete user with ID: ${id}`);
      throw new NotFoundException(`User with ID ${id} could not be deleted`);
    }
    
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
