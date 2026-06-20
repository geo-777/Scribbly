import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
export class CreateTagDTO {
  @IsString()
  @Length(1, 50)
  @ApiProperty({
    example: 'react',
  })
  name!: string;
}
