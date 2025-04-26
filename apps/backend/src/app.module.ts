// src/app.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { StudentService } from './services/student.service';
import { StudentController } from './controllers/student.controller';

@Module({
  imports: [],
  controllers: [StudentController],
  providers: [PrismaService, StudentService],
})
export class AppModule {}

