import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Job } from './job.entity';
import { JobStatus } from './job-status.enum';

const ALLOWED_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  [JobStatus.PENDING]: [JobStatus.RUNNING, JobStatus.FAILED],
  [JobStatus.RUNNING]: [JobStatus.COMPLETED, JobStatus.FAILED],
  [JobStatus.COMPLETED]: [],
  [JobStatus.FAILED]: [],
};

@Injectable()
export class JobsService {
  constructor(@InjectRepository(Job) private readonly jobs: Repository<Job>) {}

  create(input: CreateJobDto) { return this.jobs.save(this.jobs.create(input)); }
  findAll() { return this.jobs.find({ order: { createdAt: 'DESC' } }); }

  async updateStatus(id: string, { status }: UpdateStatusDto) {
    // The predicate is intentionally part of the SQL update: validation in React alone
    // cannot protect direct API callers or two near-simultaneous browser requests.
    const allowedPrevious = Object.entries(ALLOWED_TRANSITIONS)
      .filter(([, next]) => next.includes(status))
      .map(([current]) => current as JobStatus);
    const result = await this.jobs.createQueryBuilder()
      .update(Job).set({ status }).where('id = :id AND status IN (:...allowedPrevious)', { id, allowedPrevious })
      .execute();
    if (result.affected === 1) return this.jobs.findOneByOrFail({ id });
    const existing = await this.jobs.findOneBy({ id });
    if (!existing) throw new NotFoundException(`Job ${id} was not found`);
    throw new ConflictException(`Cannot change a ${existing.status} job to ${status}`);
  }

  async remove(id: string) {
    const result = await this.jobs.delete(id);
    if (!result.affected) throw new NotFoundException(`Job ${id} was not found`);
  }
}
