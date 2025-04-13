import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { StudentService } from '../services/student.service';
import { Student } from '../entities/student.entity';

@Controller('api/students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  async createStudent(@Body() studentData: Partial<Student>): Promise<Student> {
    return this.studentService.createStudent(studentData);
  }

  @Get()
  async getStudents(): Promise<Student[]> {
    return this.studentService.getStudents();
  }

  @Get(':id')
  async getStudentById(@Param('id') id: number): Promise<Student | null> {
    return this.studentService.getStudentById(id);
  }

  @Put(':id')
  async updateStudent(
    @Param('id') id: number,
    @Body() updateData: Partial<Student>,
  ): Promise<Student | null> {
    return this.studentService.updateStudent(id, updateData);
  }

  @Delete(':id')
  async deleteStudent(@Param('id') id: number): Promise<void> {
    return this.studentService.deleteStudent(id);
  }
}
