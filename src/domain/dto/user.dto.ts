export class CreateUserDto {
  name: string;
  email: string;
  password: string;
}

export class LoginUserDto {
  email: string;
  password: string;
}

export class UpdateUserDto {
  name?: string;
  email?: string;
}

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export class LoginResponseDto {
  accessToken: string;
  user: UserResponseDto;
}
