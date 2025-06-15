import React, { useState, useEffect } from 'react';
import { Schedule, Student, ScheduleFormData, RecurrenceOption } from '../../types/schedule';
import StudentSearchModal from './StudentSearchModal';
import { getStudent } from '../../api/student';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ScheduleFormData) => void;
  mode: 'create' | 'edit';
  selectedDate: string;
  selectedSchedule?: Schedule | null;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  mode,
  selectedDate,
  selectedSchedule
}) => {
  // ISO 날짜 문자열을 YYYY-MM-DD 형식으로 변환하는 함수
  const formatDate = (isoDate: string): string => {
    return isoDate.split('T')[0];
  };

  const [formData, setFormData] = useState<ScheduleFormData>({
    studentId: 0,
    startTime: '09:00',
    endTime: '09:30',
    date: selectedDate,
    recurrence: { 
      type: 'single',
      endDate: '2025-10-15'
    }
  });
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isStudentSearchOpen, setIsStudentSearchOpen] = useState(false);
  const [editType, setEditType] = useState<'single' | 'future'>('single');

  // 30분 단위 시간 옵션 생성
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeStr);
    }
  }

  useEffect(() => {
    if (isOpen) {
      if (mode === 'create') {
        setFormData({
          studentId: 0,
          startTime: '18:00',
          endTime: '21:00',
          date: selectedDate,
          recurrence: { 
            type: 'single',
            endDate: '2025-10-15'
          }
        });
        setSelectedStudent(null);
      } else if (selectedSchedule) {
        setFormData({
          studentId: selectedSchedule.studentId,
          startTime: selectedSchedule.startTime,
          endTime: selectedSchedule.endTime,
          date: formatDate(selectedSchedule.date),
          recurrence: { 
            type: selectedSchedule.isRecurring ? 'weekly' : 'single',
            endDate: selectedSchedule.recurrenceEndDate ? formatDate(selectedSchedule.recurrenceEndDate) : '2025-10-15'
          }
        });
        fetchStudent(selectedSchedule.studentId);
      }
    }
  }, [isOpen, mode, selectedDate, selectedSchedule]);

  const fetchStudent = async (studentId: number) => {
    try {
      const student = await getStudent(studentId);
      setSelectedStudent(student);
    } catch (error) {
      console.error('Failed to fetch student:', error);
      alert('수강생 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleInputChange = (field: keyof ScheduleFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRecurrenceChange = (field: keyof RecurrenceOption, value: any) => {
    setFormData(prev => ({
      ...prev,
      recurrence: {
        ...prev.recurrence,
        [field]: value
      }
    }));
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    handleInputChange('studentId', student.id);
    setIsStudentSearchOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      alert('수강생을 선택해주세요.');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      alert('종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }

    const submitData = {
      ...formData,
      editType: mode === 'edit' ? editType : undefined
    };

    onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">
          {mode === 'create' ? '스케쥴 등록' : '스케쥴 수정'}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* 수강생 선택 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              수강생 *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={selectedStudent?.name || ''}
                placeholder="수강생을 선택해주세요"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
              <button
                type="button"
                onClick={() => setIsStudentSearchOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                검색
              </button>
            </div>
          </div>

          {/* 날짜 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              날짜 *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* 시간 설정 */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작 시간 *
              </label>
              <select
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                {timeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종료 시간 *
              </label>
              <select
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                {timeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 반복 옵션 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              반복 옵션
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="recurrenceType"
                  value="single"
                  checked={formData.recurrence.type === 'single'}
                  onChange={(e) => handleRecurrenceChange('type', e.target.value)}
                  className="mr-2"
                />
                해당 일정만
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="recurrenceType"
                  value="weekly"
                  checked={formData.recurrence.type === 'weekly'}
                  onChange={(e) => handleRecurrenceChange('type', e.target.value)}
                  className="mr-2"
                />
                매주 반복 등록
              </label>
            </div>
            
            {formData.recurrence.type === 'weekly' && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  반복 종료 날짜
                </label>
                <input
                  type="date"
                  value={formData.recurrence.endDate || ''}
                  onChange={(e) => handleRecurrenceChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            )}
          </div>

          {/* 수정 모드에서만 표시되는 옵션 */}
          {mode === 'edit' && selectedSchedule?.isRecurring && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                수정 범위
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="editType"
                    value="single"
                    checked={editType === 'single'}
                    onChange={(e) => setEditType(e.target.value as 'single' | 'future')}
                    className="mr-2"
                  />
                  선택한 일정만 수정
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="editType"
                    value="future"
                    checked={editType === 'future'}
                    onChange={(e) => setEditType(e.target.value as 'single' | 'future')}
                    className="mr-2"
                  />
                  이후 일정 일괄 수정
                </label>
              </div>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {mode === 'create' ? '등록' : '수정'}
            </button>
          </div>
        </form>
      </div>

      {/* 수강생 검색 모달 */}
      <StudentSearchModal
        isOpen={isStudentSearchOpen}
        onClose={() => setIsStudentSearchOpen(false)}
        onSelect={handleStudentSelect}
      />
    </div>
  );
};

export default ScheduleModal; 