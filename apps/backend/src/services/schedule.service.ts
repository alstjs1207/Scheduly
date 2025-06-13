import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { CreateScheduleDto, UpdateScheduleDto, DeleteScheduleDto } from '../dto/schedule.dto';
import { Schedule, Prisma } from '@prisma/client';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  // 스케줄 목록 조회
  async findAll(): Promise<Schedule[]> {
    return this.prisma.schedule.findMany({
      include: {
        student: true,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  // 스케줄 생성
  async create(data: CreateScheduleDto): Promise<Schedule> {
    const student = await this.prisma.student.findUnique({
      where: { id: data.studentId },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${data.studentId} not found`);
    }

    const createData: Prisma.ScheduleCreateInput = {
      student: {
        connect: { externalId: student.externalId }
      },
      title: data.title || `${student.name} 수업`,
      startTime: data.startTime,
      endTime: data.endTime,
      date: data.date,
      isRecurring: data.isRecurring || false,
      recurrenceRule: data.recurrenceRule || null,
      recurrenceEndDate: data.recurrenceEndDate || null,
    };

    if (data.parentScheduleId) {
      createData.parent = { connect: { id: data.parentScheduleId } };
    }

    return this.prisma.schedule.create({
      data: createData,
      include: {
        student: true,
      },
    });
  }

  // 스케줄 수정
  async update(id: number, data: UpdateScheduleDto): Promise<Schedule> {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: { children: true },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    const student = await this.prisma.student.findUnique({
      where: { id: data.studentId },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${data.studentId} not found`);
    }

    const updateData: Prisma.ScheduleUpdateInput = {
      student: {
        connect: { externalId: student.externalId }
      },
      title: data.title || `${student.name} 수업`,
      startTime: data.startTime,
      endTime: data.endTime,
      date: data.date,
      isRecurring: data.isRecurring || false,
      recurrenceRule: data.recurrenceRule || null,
      recurrenceEndDate: data.recurrenceEndDate || null,
    };

    if (data.parentScheduleId) {
      updateData.parent = { connect: { id: data.parentScheduleId } };
    } else if (data.parentScheduleId === null) {
      updateData.parent = { disconnect: true };
    }

    // 이후 일정 일괄 수정
    if (data.editType === 'future' && schedule.isRecurring) {
      // 1. 기존 반복 일정의 자식 일정들 삭제
      await this.prisma.schedule.deleteMany({
        where: {
          parentScheduleId: schedule.id,
          date: {
            gte: data.date,
          },
        },
      });

      // 2. 새로운 반복 일정 생성
      return this.prisma.schedule.update({
        where: { id },
        data: updateData,
        include: {
          student: true,
        },
      });
    }

    // 단일 일정 수정
    return this.prisma.schedule.update({
      where: { id },
      data: updateData,
      include: {
        student: true,
      },
    });
  }

  // 스케줄 삭제
  async delete(id: number, options: DeleteScheduleDto): Promise<void> {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    if (options.deleteType === 'future' && schedule.isRecurring) {
      // 이후 일정 일괄 삭제
      await this.prisma.schedule.deleteMany({
        where: {
          OR: [
            { id },
            {
              parentScheduleId: schedule.id,
              date: {
                gte: schedule.date,
              },
            },
          ],
        },
      });
    } else {
      // 단일 일정 삭제
      await this.prisma.schedule.delete({
        where: { id },
      });
    }
  }
} 