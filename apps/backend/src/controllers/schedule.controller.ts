import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ScheduleService } from '../services/schedule.service';
import { CreateScheduleDto, UpdateScheduleDto, DeleteScheduleDto } from '../dto/schedule.dto';
import { Schedule } from '@prisma/client';

@Controller('api/schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async findAll(): Promise<Schedule[]> {
    return this.scheduleService.findAll();
  }

  @Post()
  async create(@Body() data: CreateScheduleDto): Promise<Schedule> {
    return this.scheduleService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateScheduleDto,
  ): Promise<Schedule> {
    return this.scheduleService.update(id, data);
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Body() options: DeleteScheduleDto,
  ): Promise<void> {
    return this.scheduleService.delete(id, options);
  }
} 