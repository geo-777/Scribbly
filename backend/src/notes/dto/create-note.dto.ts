import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  ArrayUnique,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateNoteDto {
  @ApiProperty({ minLength: 3, maxLength: 50, example: 'Grocery list' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  title!: string;

  @ApiProperty({ minLength: 1, maxLength: 5000, example: 'Buy milk and eggs' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 5000)
  content!: string;

  @ApiPropertyOptional({
    type: [Number],
    description: 'Array of tag ids',
    example: [1, 2],
  })
  @IsArray()
  @ArrayUnique()
  @IsOptional()
  @Type(() => Number)
  @IsInt({ each: true })
  tags?: number[];
}
