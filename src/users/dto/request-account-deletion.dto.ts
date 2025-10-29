import { IsString, IsOptional, MaxLength } from 'class-validator';

export class RequestAccountDeletionDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
