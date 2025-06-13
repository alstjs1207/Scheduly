import axios from 'axios';
import { Student } from '../types/schedule';

export const getStudents = async (params?: { state?: string }): Promise<Student[]> => {
  try {
    const response = await axios.get<Student[]>('/api/students', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch students:', error);
    throw error;
  }
};

export const getStudent = async (id: string): Promise<Student> => {
  try {
    const response = await axios.get<Student>(`/api/students/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch student:', error);
    throw error;
  }
}; 