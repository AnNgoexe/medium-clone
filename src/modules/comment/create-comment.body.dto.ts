import { IsNotEmpty, IsString } from 'class-validator';

export default class CreateCommentBodyDto {
  @IsNotEmpty({ message: 'Comment must not be empty' })
  @IsString({ message: 'Comment must not be empty' })
  body!: string;
}
