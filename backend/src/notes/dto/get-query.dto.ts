import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
export class GetNotesQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @ApiPropertyOptional({ type: Boolean })
  archived?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @ApiPropertyOptional({ type: Boolean })
  pinned?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @ApiPropertyOptional({ type: Boolean })
  favourite?: boolean;

  @IsOptional()
  @ApiPropertyOptional({ type: String })
  search?: string;

  @IsOptional()
  @ApiPropertyOptional({ type: String, description: 'Filter by tag name' })
  tag?: string;
}
