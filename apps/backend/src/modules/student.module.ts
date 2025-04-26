// src/modules/student.module.ts
import { Module } from '@nestjs/common';
import { StudentService } from '../services/student.service';
import { StudentController } from '../controllers/student.controller';
import { PrismaService } from '../services/prisma.service';

@Module({
  providers: [StudentService, PrismaService],
  controllers: [StudentController],
})
export class StudentModule {}
