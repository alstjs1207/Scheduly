import { IsString, IsNumber, IsBoolean, IsOptional, IsDate } from 'class-validator';

export class CreateScheduleDto {
  @IsNumber()
  studentId: number;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsString()
  date: string;

  @IsBoolean()
  isRecurring: boolean;

  @IsString()
  @IsOptional()
  recurrenceRule?: string;

  @IsString()
  @IsOptional()
  recurrenceEndDate?: string;
}

export class UpdateScheduleDto {
  @IsNumber()
  @IsOptional()
  studentId?: number;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  editType: 'single' | 'future';
}

export class DeleteScheduleDto {
  @IsString()
  deleteType: 'single' | 'future';
} 