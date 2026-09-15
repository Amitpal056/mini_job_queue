import { IsEnum } from 'class-validator';
import { JobStatus } from '../job-status.enum';

export class UpdateStatusDto {
  @IsEnum(JobStatus) status!: JobStatus;
}
