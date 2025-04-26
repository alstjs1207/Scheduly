// src/services/student.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Prisma, Student, StudentState } from '../generated/prisma';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  async createStudent(studentData: Prisma.StudentCreateInput): Promise<Student> {
    return this.prisma.student.create({
      data: studentData,
    });
  }

  async getStudents(): Promise<Student[]> {
    return this.prisma.student.findMany();
  }

  async getStudentById(id: number): Promise<Student | null> {
    return this.prisma.student.findUnique({
      where: { id },
    });
  }

  async updateStudent(id: number, updateData: Prisma.StudentUpdateInput): Promise<Student | null> {
    return this.prisma.student.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteStudent(id: number): Promise<void> {
    await this.prisma.student.update({
      where: { id },
      data: { state: StudentState.DELETED },
    });
  }
}

