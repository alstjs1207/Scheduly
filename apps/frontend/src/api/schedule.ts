import axios from 'axios';
import { Schedule, ScheduleFormData, ScheduleEditOptions } from '../types/schedule';

const toISOString = (date: string | undefined): string | null => {
  if (!date) return null;
  return new Date(date).toISOString();
};

export const getSchedules = async (): Promise<Schedule[]> => {
  try {
    const response = await axios.get<Schedule[]>('/api/schedules');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch schedules:', error);
    throw error;
  }
};

export const createSchedule = async (data: ScheduleFormData): Promise<Schedule> => {
  try {
    const { recurrence, ...scheduleData } = data;
    const payload = {
      ...scheduleData,
      date: toISOString(data.date),
      isRecurring: recurrence.type === 'weekly',
      recurrenceRule: recurrence.type === 'weekly' ? 'FREQ=WEEKLY' : null,
      recurrenceEndDate: recurrence.type === 'weekly' ? toISOString(recurrence.endDate) : null
    };
    const response = await axios.post<Schedule>('/api/schedules', payload);
    return response.data;
  } catch (error) {
    console.error('Failed to create schedule:', error);
    throw error;
  }
};

export const updateSchedule = async (
  id: string,
  data: ScheduleFormData & ScheduleEditOptions
): Promise<Schedule> => {
  try {
    const { recurrence, editType, ...scheduleData } = data;
    const payload = {
      ...scheduleData,
      date: toISOString(data.date),
      isRecurring: recurrence.type === 'weekly',
      recurrenceRule: recurrence.type === 'weekly' ? 'FREQ=WEEKLY' : null,
      recurrenceEndDate: recurrence.type === 'weekly' ? toISOString(recurrence.endDate) : null,
      editType
    };
    const response = await axios.put<Schedule>(`/api/schedules/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Failed to update schedule:', error);
    throw error;
  }
};

export const deleteSchedule = async (
  id: string,
  options: { deleteType: 'single' | 'future' }
): Promise<void> => {
  try {
    await axios.delete(`/api/schedules/${id}`, { data: options });
  } catch (error) {
    console.error('Failed to delete schedule:', error);
    throw error;
  }
}; 