import React, { useState, useEffect } from 'react';
import { Schedule, ScheduleFormData, ScheduleEditOptions, ScheduleDeleteOptions } from '../../types/schedule';
import ScheduleCalendar from './ScheduleCalendar';
import { RRule } from 'rrule';
import { getSchedules, createSchedule, updateSchedule, deleteSchedule } from '../../api/schedule';
import { useNavigate } from 'react-router-dom';

const SchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await getSchedules();
      setSchedules(response);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleCreate = async (data: ScheduleFormData) => {
    try {
      setLoading(true);
      await createSchedule(data);
      await fetchSchedules();
    } catch (error) {
      console.error('Failed to create schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleUpdate = async (id: string, data: ScheduleFormData & ScheduleEditOptions) => {
    try {
      setLoading(true);
      await updateSchedule(id, data);
      await fetchSchedules();
    } catch (error) {
      console.error('Failed to update schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleDelete = async (id: string, options: ScheduleDeleteOptions) => {
    try {
      setLoading(true);
      await deleteSchedule(id, options);
      await fetchSchedules();
    } catch (error) {
      console.error('Failed to delete schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = (studentId: string) => {
    navigate(`/students/${studentId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>처리 중...</span>
          </div>
        </div>
      )}
      
      <ScheduleCalendar
        schedules={schedules}
        onScheduleCreate={handleScheduleCreate}
        onScheduleUpdate={handleScheduleUpdate}
        onScheduleDelete={handleScheduleDelete}
        onStudentClick={handleStudentClick}
      />
    </div>
  );
};

export default SchedulePage; 