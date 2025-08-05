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
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../domain/service/user.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto, LoginUserDto, LoginResponseDto } from '../../domain/dto/user.dto';

@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginUserDto): Promise<LoginResponseDto> {
    this.logger.log(`Processing login request for email: ${loginUserDto.email}`);
    
    const user = await this.userService.findByEmail(loginUserDto.email);
    
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);
    
    this.logger.log(`Successfully generated token for user: ${user.id}`);
    
    return {
      accessToken,
      user
    };
  }

  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    this.logger.log('Processing request to get all users');
    const result = await this.userService.findAll();
    this.logger.log('Finished processing request to get all users');
    return result;
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    this.logger.log(`Processing request to get user with ID: ${id}`);
    const result = await this.userService.findById(id);
    this.logger.log(`Finished processing request to get user with ID: ${id}`);
    return result;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    this.logger.log(`Processing request to create user with email: ${createUserDto.email}`);
    const result = await this.userService.create(createUserDto);
    this.logger.log(`Finished processing request to create user with ID: ${result.id}`);
    return result;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    this.logger.log(`Processing request to update user with ID: ${id}`);
    const result = await this.userService.update(id, updateUserDto);
    this.logger.log(`Finished processing request to update user with ID: ${id}`);
    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    this.logger.log(`Processing request to delete user with ID: ${id}`);
    await this.userService.delete(id);
    this.logger.log(`Finished processing request to delete user with ID: ${id}`);
  }
}
