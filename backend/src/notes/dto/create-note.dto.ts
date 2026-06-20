import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  ArrayUnique,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 5000)
  content!: string;

  @IsArray()
  @ArrayUnique()
  @IsOptional()
  @Type(() => Number)
  @IsInt({ each: true })
  tags?: number[];
}
