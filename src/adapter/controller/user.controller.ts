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
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  /**
   * User login - PUBLIC
   * Authenticates user with email and password and returns JWT token
   * POST /users/login
   */
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful.', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @ApiBody({ type: LoginUserDto })
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

  /**
   * Get all users - PUBLIC
   * Returns a list of all registered users
   * GET /users
   */
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of all users.', type: [UserResponseDto] })
  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    this.logger.log('Processing request to get all users');
    const result = await this.userService.findAll();
    this.logger.log(`Retrieved ${result.length} users`);
    return result;
  }

  /**
   * Get user by ID - PUBLIC
   * Returns user information by their unique identifier
   * GET /users/:id
   */
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found.', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiParam({ name: 'id', description: 'User unique identifier' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    this.logger.log(`Processing request to get user with ID: ${id}`);
    const result = await this.userService.findById(id);
    this.logger.log(`Successfully retrieved user with ID: ${id}`);
    return result;
  }

  /**
   * Create new user - PUBLIC
   * Registers a new user in the system
   * POST /users
   */
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User successfully created.', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 409, description: 'User already exists.' })
  @ApiBody({ type: CreateUserDto })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    this.logger.log(`Processing request to create user with email: ${createUserDto.email}`);
    const result = await this.userService.create(createUserDto);
    this.logger.log(`Successfully created user with ID: ${result.id}`);
    return result;
  }

  /**
   * Update user by ID - PUBLIC
   * Updates user information by their unique identifier
   * PUT /users/:id
   */
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'User successfully updated.', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiParam({ name: 'id', description: 'User unique identifier' })
  @ApiBody({ type: UpdateUserDto })
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    this.logger.log(`Processing request to update user with ID: ${id}`);
    const result = await this.userService.update(id, updateUserDto);
    this.logger.log(`Successfully updated user with ID: ${id}`);
    return result;
  }

  /**
   * Delete user by ID - PUBLIC
   * Removes user from the system by their unique identifier
   * DELETE /users/:id
   */
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({ status: 204, description: 'User successfully deleted.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiParam({ name: 'id', description: 'User unique identifier' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    this.logger.log(`Processing request to delete user with ID: ${id}`);
    await this.userService.delete(id);
    this.logger.log(`Successfully deleted user with ID: ${id}`);
  }
}
