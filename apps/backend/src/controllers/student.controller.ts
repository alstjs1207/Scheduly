import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, Logger } from '@nestjs/common';
import { StudentService } from '../services/student.service';
import { Student, Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('api/students')
@UseGuards(JwtAuthGuard)
export class StudentController {
  private readonly logger = new Logger(StudentController.name);

  constructor(private readonly studentService: StudentService) {}

  @Post()
  async createStudent(@Body() studentData: Prisma.StudentCreateInput): Promise<Student> {
    return this.studentService.createStudent(studentData);
  }

  @Get()
  async getStudents(): Promise<Student[]> {
    this.logger.debug('GET /api/students 요청 받음');
    return this.studentService.getStudents();
  }

  @Get(':id')
  async getStudentById(@Param('id', ParseIntPipe) id: number): Promise<Student | null> {
    return this.studentService.getStudentById(id);
  }

  @Put(':id')
  async updateStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Prisma.StudentUpdateInput,
  ): Promise<Student | null> {
    return this.studentService.updateStudent(id, updateData);
  }

  @Delete(':id')
  async deleteStudent(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.studentService.deleteStudent(id);
  }
}
