// src/app.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { StudentService } from './services/student.service';
import { StudentController } from './controllers/student.controller';
import { ScheduleController } from './controllers/schedule.controller';
import { ScheduleService } from './services/schedule.service';

@Module({
  imports: [],
  controllers: [StudentController, ScheduleController],
  providers: [PrismaService, StudentService, ScheduleService],
})
export class AppModule {}

