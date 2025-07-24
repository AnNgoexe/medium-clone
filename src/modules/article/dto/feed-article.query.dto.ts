import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FeedArticlesQueryDto {
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
