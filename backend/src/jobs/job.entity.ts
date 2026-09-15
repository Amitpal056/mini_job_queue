import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { JobStatus } from './job-status.enum';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ length: 120 }) title!: string;
  @Column({ length: 60 }) type!: string;
  @Column({ type: 'text', default: JobStatus.PENDING }) status!: JobStatus;
  @CreateDateColumn() createdAt!: Date;
}
