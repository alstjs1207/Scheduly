import { IsString, IsOptional, IsBoolean, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateScheduleDto {
  @IsNumber()
  studentId: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsString()
  @IsOptional()
  recurrenceRule?: string;

  @IsString()
  @IsOptional()
  recurrenceEndDate?: string;

  @IsNumber()
  @IsOptional()
  parentScheduleId?: number;
}

export class UpdateScheduleDto extends CreateScheduleDto {
  @IsString()
  @IsOptional()
  editType?: 'single' | 'future';
}

export class DeleteScheduleDto {
  @IsString()
  @IsOptional()
  deleteType?: 'single' | 'future';
} 