import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsModule } from './jobs/jobs.module';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      // Falls back to /tmp/jobs.sqlite on Render or production environments to avoid permission errors
      database: process.env.DATABASE_PATH ?? (process.env.NODE_ENV === 'production' ? '/tmp/jobs.sqlite' : 'jobs.sqlite'),
      autoLoadEntities: true,
      synchronize: true,
    }),
    JobsModule,
  ],
})
export class AppModule {}
