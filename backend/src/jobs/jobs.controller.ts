import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobs: JobsService) {}
  @Post() create(@Body() dto: CreateJobDto) { return this.jobs.create(dto); }
  @Get() findAll() { return this.jobs.findAll(); }
  @Patch(':id/status') updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) { return this.jobs.updateStatus(id, dto); }
  @Delete(':id') @HttpCode(204) remove(@Param('id') id: string) { return this.jobs.remove(id); }
}
