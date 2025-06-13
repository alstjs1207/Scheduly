export interface Student {
  id: number;
  externalId: string;
  name: string;
  state: 'NORMAL' | 'GRADUATE' | 'DELETED';
  type: 'EXAMINEE' | 'DROPPER' | 'ADULT';
  region: string;
  age: number;
  description: string;
  startDate: string;
  endDate: string;
  parentInfo: string;
  phoneNumber: string;
}

export interface Schedule {
  id: string;
  studentExternalId: string;
  student: Student;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  isRecurring: boolean;
  recurrenceRule?: string;
  recurrenceEndDate?: string;
  parentScheduleId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecurrenceOption {
  type: 'single' | 'weekly';
  endDate?: string;
}

export interface ScheduleFormData {
  studentExternalId: string;
  startTime: string;
  endTime: string;
  date: string;
  recurrence: RecurrenceOption;
}

export interface ScheduleEditOptions {
  editType: 'single' | 'future';
  data: Partial<ScheduleFormData>;
}

export interface ScheduleDeleteOptions {
  deleteType: 'single' | 'future';
} 