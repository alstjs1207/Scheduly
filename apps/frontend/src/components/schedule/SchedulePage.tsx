import React, { useState, useEffect } from 'react';
import { Schedule, ScheduleFormData, ScheduleEditOptions, ScheduleDeleteOptions } from '../../types/schedule';
import ScheduleCalendar from './ScheduleCalendar';
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
      alert('일정을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleCreate = async (data: ScheduleFormData) => {
    try {
      setLoading(true);
      const newSchedules = await createSchedule(data);
      const schedulesToAdd = Array.isArray(newSchedules) ? newSchedules : [newSchedules];
      setSchedules(prev => [...prev, ...schedulesToAdd]);
    } catch (error) {
      console.error('Failed to create schedule:', error);
      alert('일정 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleUpdate = async (id: string, data: ScheduleFormData & ScheduleEditOptions) => {
    try {
      setLoading(true);
      const updatedSchedules = await updateSchedule(id, data);
      const schedulesToUpdate = Array.isArray(updatedSchedules) ? updatedSchedules : [updatedSchedules];
      setSchedules(prev => {
        const filtered = prev.filter(schedule => {
          if (data.editType === 'single') {
            return schedule.id !== id;
          }
          if (data.editType === 'future') {
            const targetSchedule = prev.find(s => s.id === id);
            return !targetSchedule || new Date(schedule.date) < new Date(targetSchedule.date);
          }
          return true;
        });
        return [...filtered, ...schedulesToUpdate];
      });
    } catch (error) {
      console.error('Failed to update schedule:', error);
      alert('일정 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleDelete = async (id: string, options: ScheduleDeleteOptions) => {
    try {
      setLoading(true);
      await deleteSchedule(id, options);
      setSchedules(prev => {
        const targetSchedule = prev.find(s => s.id === id);
        if (!targetSchedule) return prev;

        if (options.deleteType === 'single' || !targetSchedule.isRecurring) {
          return prev.filter(s => s.id !== id);
        }

        // 이후 일정 모두 삭제
        return prev.filter(schedule => {
          const scheduleDate = new Date(schedule.date);
          const targetDate = new Date(targetSchedule.date);
          const isPartOfSeries = 
            (schedule.parentScheduleId && targetSchedule.parentScheduleId && 
             schedule.parentScheduleId === targetSchedule.parentScheduleId) || 
            schedule.id === targetSchedule.parentScheduleId?.toString() ||
            schedule.parentScheduleId === parseInt(id) ||
            schedule.id === id;
          
          if (!isPartOfSeries) return true;
          return scheduleDate < targetDate;
        });
      });
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      alert('일정 삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = (studentId: number) => {
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