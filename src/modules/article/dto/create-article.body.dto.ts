import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsArray,
  IsBoolean,
} from 'class-validator';

export class CreateArticleBodyDto {
  @IsNotEmpty({ message: 'Title must not be empty' })
  @IsString({ message: 'Title must be a string' })
  title!: string;

  @IsNotEmpty({ message: 'Description must not be empty' })
  @IsString({ message: 'Description must be a string' })
  description!: string;

  @IsNotEmpty({ message: 'Body must not be empty' })
  @IsString({ message: 'Body must be a string' })
  body!: string;

  @IsOptional()
  @IsArray({ message: 'Tag list must be an array of strings' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tagList?: string[];

  @IsOptional()
  @IsBoolean({ message: 'isDraft must be a boolean' })
  isDraft?: boolean;
}
