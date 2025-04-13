// src/services/student.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student, StudentState } from '../entities/student.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async createStudent(studentData: Partial<Student>): Promise<Student> {
    const student = this.studentRepository.create(studentData);
    return this.studentRepository.save(student);
  }

  async getStudents(): Promise<Student[]> {
    return this.studentRepository.find();
  }

  async getStudentById(id: number): Promise<Student | null> {
    return this.studentRepository.findOne({where: {id}});
  }

  async updateStudent(id: number, updateData: Partial<Student>): Promise<Student | null> {
    await this.studentRepository.update(id, updateData);
    return this.getStudentById(id);
  }

  async deleteStudent(id: number): Promise<void> {
    await this.studentRepository.update(id, { state: StudentState.DELETED });
  }
}

