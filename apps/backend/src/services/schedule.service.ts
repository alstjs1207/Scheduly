import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateScheduleDto, UpdateScheduleDto, DeleteScheduleDto } from '../dto/schedule.dto';
import { Schedule, Prisma } from '@prisma/client';
import { RRule } from 'rrule';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

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

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule[]> {
    const { studentId, startTime, endTime, date, isRecurring, recurrenceRule, recurrenceEndDate } = createScheduleDto;
    // 단일 일정인 경우
    if (!isRecurring) {
      const schedule = await this.prisma.schedule.create({
        data: {
          studentId,
          title: '수업', // 기본 제목 설정
          startTime,
          endTime,
          date: new Date(date),
          isRecurring: false,
        },
        include: {
          student: true,
        },
      });
      return [schedule];
    }

    // 반복 일정인 경우
    const startDate = new Date(date);
    const endDate = recurrenceEndDate ? new Date(recurrenceEndDate) : undefined;

    // 선택한 날짜의 요일을 RRule 요일 형식으로 변환
    const weekdays = [RRule.SU, RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA];
    const selectedWeekday = weekdays[startDate.getDay()];

    const rule = new RRule({
      freq: RRule.WEEKLY,
      dtstart: startDate,
      until: endDate,
      interval: 1,
      byweekday: [selectedWeekday],
    });

    const dates = rule.all();
    if (dates.length === 0) {
      throw new Error('반복 일정 생성에 실패했습니다. 날짜를 확인해주세요.');
    }

    // 첫 번째 일정 생성
    const parentSchedule = await this.prisma.schedule.create({
      data: {
        studentId,
        title: '수업', // 기본 제목 설정
        startTime,
        endTime,
        date: dates[0],
        isRecurring: true,
        recurrenceRule,
        recurrenceEndDate: endDate?.toISOString(),
      },
      include: {
        student: true,
      },
    });

    if (dates.length === 1) {
      return [parentSchedule];
    }

    // 나머지 반복 일정 생성
    const childSchedules = await this.prisma.$transaction(
      dates.slice(1).map((date) =>
        this.prisma.schedule.create({
          data: {
            studentId,
            title: '수업', // 기본 제목 설정
            startTime,
            endTime,
            date,
            isRecurring: true,
            recurrenceRule,
            recurrenceEndDate: endDate?.toISOString(),
            parentScheduleId: parentSchedule.id,
          },
          include: {
            student: true,
          },
        })
      )
    );

    return [parentSchedule, ...childSchedules];
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto): Promise<Schedule[]> {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id: parseInt(id) },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    const { editType, ...updateData } = updateScheduleDto;

    if (!schedule.isRecurring || editType === 'single') {
      const updatedSchedule = await this.prisma.schedule.update({
        where: { id: parseInt(id) },
        data: {
          ...updateData,
          date: updateData.date ? new Date(updateData.date) : undefined,
        },
        include: {
          student: true,
        },
      });
      return [updatedSchedule];
    }

    // 이후 일정 모두 수정
    const schedules = await this.prisma.schedule.findMany({
      where: {
        OR: [
          { id: parseInt(id) },
          { parentScheduleId: parseInt(id) },
        ],
        date: {
          gte: schedule.date,
        },
      },
    });

    const updatedSchedules = await this.prisma.$transaction(
      schedules.map((schedule) =>
        this.prisma.schedule.update({
          where: { id: schedule.id },
          data: {
            ...updateData,
            date: updateData.date ? new Date(updateData.date) : undefined,
          },
          include: {
            student: true,
          },
        })
      )
    );

    return updatedSchedules;
  }

  async delete(id: string, deleteScheduleDto: DeleteScheduleDto): Promise<void> {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id: parseInt(id) },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    const { deleteType } = deleteScheduleDto;

    if (!schedule.isRecurring || deleteType === 'single') {
      await this.prisma.schedule.delete({
        where: { id: parseInt(id) },
      });
      return;
    }

    // 이후 일정 모두 삭제
    await this.prisma.schedule.deleteMany({
      where: {
        OR: [
          { id: schedule.id },
          { parentScheduleId: schedule.parentScheduleId },
        ],
        date: {
          gte: schedule.date,
        },
      },
    });
  }
} 