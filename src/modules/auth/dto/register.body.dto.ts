import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export default class RegisterBodyDto {
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username must not be empty' })
  username!: string;

  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email must not be empty' })
  email!: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password must not be empty' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/, {
    message:
      'Password must include uppercase, lowercase, number, and special character',
  })
  password!: string;
}
