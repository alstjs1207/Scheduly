import { Module } from '@nestjs/common';
import { ScheduleController } from '../controllers/schedule.controller';
import { ScheduleService } from '../services/schedule.service';
import { PrismaService } from '../services/prisma.service';

@Module({
  providers: [ScheduleService, PrismaService],
  controllers: [ScheduleController],
  exports: [ScheduleService],
})
export class ScheduleModule {} 