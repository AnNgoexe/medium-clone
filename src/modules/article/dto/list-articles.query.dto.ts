import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListArticlesQueryDto {
  @IsOptional()
  @IsString({ message: 'Tag must be a string' })
  tag?: string;

  @IsOptional()
  @IsString({ message: 'Author must be a string' })
  author?: string;

  @IsOptional()
  @IsString({ message: 'Favorited must be a string' })
  favorited?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Offset must be an integer' })
  @Min(0)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Offset must be an integer' })
  @Min(0)
  offset?: number;
}
