// src/modules/student.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../entities/student.entity';
import { StudentService } from '../services/student.service';
import { StudentController } from '../controllers/student.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Student])],
  providers: [StudentService],
  controllers: [StudentController],
})
export class StudentModule {}
