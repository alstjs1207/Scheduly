import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ScheduleService } from '../services/schedule.service';
import { CreateScheduleDto, UpdateScheduleDto, DeleteScheduleDto } from '../dto/schedule.dto';
import { Schedule } from '@prisma/client';

@Controller('api/schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async findAll(): Promise<Schedule[]> {
    try {
      return await this.scheduleService.findAll();
    } catch (error) {
      throw new HttpException('Failed to fetch schedules', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  async create(@Body() createScheduleDto: CreateScheduleDto): Promise<Schedule[]> {
    try {
      return await this.scheduleService.create(createScheduleDto);
    } catch (error) {
      throw new HttpException('Failed to create schedule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ): Promise<Schedule[]> {
    try {
      return await this.scheduleService.update(id, updateScheduleDto);
    } catch (error) {
      if (error.message === 'Schedule not found') {
        throw new HttpException('Schedule not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Failed to update schedule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Body() deleteScheduleDto: DeleteScheduleDto,
  ): Promise<void> {
    try {
      await this.scheduleService.delete(id, deleteScheduleDto);
    } catch (error) {
      if (error.message === 'Schedule not found') {
        throw new HttpException('Schedule not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Failed to delete schedule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 