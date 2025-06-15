import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Student } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateStudent(phoneNumber: string, password: string): Promise<any> {
    const student = await this.prisma.student.findFirst({
      where: { 
        phoneNumber,
        type: 'ADMIN',
      },
    });

    if (!student) {
      throw new UnauthorizedException('관리자 계정이 존재하지 않습니다.');
    }

    if (!student.password) {
      throw new UnauthorizedException('비밀번호가 설정되지 않았습니다.');
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    return student;
  }

  async login(student: Student) {
    const payload = { 
      sub: student.id,
      phoneNumber: student.phoneNumber,
      type: student.type 
    };

    return {
      access_token: this.jwtService.sign(payload),
      student: {
        id: student.id,
        name: student.name,
        type: student.type,
      }
    };
  }
} 