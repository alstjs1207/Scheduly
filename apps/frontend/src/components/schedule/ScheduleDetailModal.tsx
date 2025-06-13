import React from 'react';
import { Schedule, ScheduleDeleteOptions } from '../../types/schedule';

interface ScheduleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: Schedule | null;
  onEdit: (schedule: Schedule) => void;
  onDelete: (schedule: Schedule, options: ScheduleDeleteOptions) => void;
  onStudentClick: (studentId: string) => void;
}

const ScheduleDetailModal: React.FC<ScheduleDetailModalProps> = ({
  isOpen,
  onClose,
  schedule,
  onEdit,
  onDelete,
  onStudentClick,
}) => {
  if (!isOpen || !schedule) return null;

  // ISO 날짜 문자열을 YYYY-MM-DD 형식으로 변환하는 함수
  const formatDate = (isoDate: string): string => {
    return isoDate.split('T')[0];
  };

  const handleDelete = (deleteType: 'single' | 'future') => {
    onDelete(schedule, { deleteType });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">수업 상세 정보</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="sr-only">닫기</span>
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <span className="font-medium text-gray-700">수강생:</span>{' '}
            <button
              onClick={() => onStudentClick(schedule.studentExternalId)}
              className="text-blue-600 hover:underline"
            >
              {schedule.student.name}
            </button>
          </div>
          <div>
            <span className="font-medium text-gray-700">날짜:</span>{' '}
            {formatDate(schedule.date)}
          </div>
          <div>
            <span className="font-medium text-gray-700">시간:</span>{' '}
            {schedule.startTime} - {schedule.endTime}
          </div>
          {schedule.isRecurring && (
            <div>
              <span className="font-medium text-gray-700">반복:</span> 매주
              {schedule.recurrenceEndDate && (
                <span> (종료: {formatDate(schedule.recurrenceEndDate)})</span>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => onEdit(schedule)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            수정
          </button>
          <button
            onClick={() => handleDelete('single')}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            삭제
          </button>
          {schedule.isRecurring && (
            <button
              onClick={() => handleDelete('future')}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              이후 일정 모두 삭제
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetailModal; 