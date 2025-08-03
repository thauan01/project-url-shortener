import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Logger,
  HttpCode,
  HttpStatus 
} from '@nestjs/common';
import { UserService } from '../../domain/service/user.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../../domain/dto/user.dto';

@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(): UserResponseDto[] {
    this.logger.log('Processing request to get all users');
    const result = this.userService.findAll();
    this.logger.log('Finished processing request to get all users');
    return result;
  }

  @Get(':id')
  findOne(@Param('id') id: string): UserResponseDto {
    this.logger.log(`Processing request to get user with ID: ${id}`);
    const result = this.userService.findById(id);
    this.logger.log(`Finished processing request to get user with ID: ${id}`);
    return result;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto): UserResponseDto {
    this.logger.log(`Processing request to create user with email: ${createUserDto.email}`);
    const result = this.userService.create(createUserDto);
    this.logger.log(`Finished processing request to create user with ID: ${result.id}`);
    return result;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): UserResponseDto {
    this.logger.log(`Processing request to update user with ID: ${id}`);
    const result = this.userService.update(id, updateUserDto);
    this.logger.log(`Finished processing request to update user with ID: ${id}`);
    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): void {
    this.logger.log(`Processing request to delete user with ID: ${id}`);
    this.userService.delete(id);
    this.logger.log(`Finished processing request to delete user with ID: ${id}`);
  }
}
