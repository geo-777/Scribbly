import { IsOptional, IsBoolean, IsString, Length } from 'class-validator';

export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  @Length(3, 50)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(1, 5000)
  content?: string;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;
}
