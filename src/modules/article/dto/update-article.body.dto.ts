import { IsOptional, IsString } from 'class-validator';

export class UpdateArticleBodyDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Body must be a string' })
  body?: string;
}
