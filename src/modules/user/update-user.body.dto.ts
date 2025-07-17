import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MinLength,
} from 'class-validator';

export default class UpdateUserBodyDto {
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Username must be a string' })
  username?: string;

  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/, {
    message:
      'Password must include uppercase, lowercase, number, and special character',
  })
  password?: string;

  @IsOptional()
  @IsString({ message: 'Bio must be a string' })
  bio?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Image must be a valid URL' })
  image?: string;
}
