import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsModule } from './jobs/jobs.module';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite', database: process.env.DATABASE_PATH ?? 'jobs.sqlite',
      autoLoadEntities: true, synchronize: true,
    }),
    JobsModule,
  ],
})
export class AppModule {}
