// src/services/student.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Prisma, Student, StudentState } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  async createStudent(studentData: Prisma.StudentCreateInput): Promise<Student> {
    const defaultPassword = `${studentData.phoneNumber}!`;
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    return this.prisma.student.create({
      data: {
        ...studentData,
        password: hashedPassword,
      },
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

  async getStudentByExternalId(externalId: string): Promise<Student | null> {
    return this.prisma.student.findFirst({
      where: {
        externalId: {
          equals: externalId,
        },
      },
    });
  }

  async updateStudent(id: number, updateData: Prisma.StudentUpdateInput): Promise<Student | null> {
    if (updateData.password && typeof updateData.password === 'string' && !updateData.password.startsWith('$2')) {
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      updateData.password = hashedPassword;
    }

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

