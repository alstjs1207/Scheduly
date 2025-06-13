import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Schedule } from '../../types/schedule';
import ScheduleModal from './ScheduleModal';
import ScheduleDetailModal from './ScheduleDetailModal';

interface ScheduleCalendarProps {
  schedules: Schedule[];
  onScheduleCreate: (schedule: any) => void;
  onScheduleUpdate: (id: string, schedule: any) => void;
  onScheduleDelete: (id: string, options: any) => void;
  onStudentClick: (studentId: string) => void;
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  schedules,
  onScheduleCreate,
  onScheduleUpdate,
  onScheduleDelete,
  onStudentClick
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // ISO 날짜 문자열을 YYYY-MM-DD 형식으로 변환하는 함수
  const formatDate = (isoDate: string): string => {
    return isoDate.split('T')[0];
  };

  // FullCalendar 이벤트 형식으로 변환
  const calendarEvents = schedules.map(schedule => ({
    id: schedule.id,
    title: `${schedule.student.name}`,
    start: `${formatDate(schedule.date)}T${schedule.startTime}`,
    end: `${formatDate(schedule.date)}T${schedule.endTime}`,
    backgroundColor: schedule.isRecurring ? '#3B82F6' : '#6B7280',
    borderColor: schedule.isRecurring ? '#2563EB' : '#4B5563',
    extendedProps: {
      schedule: {
        ...schedule,
        studentName: schedule.student.name
      }
    }
  }));

  const handleDateClick = (info: any) => {
    const clickedDate = info.dateStr;
    const today = new Date().toISOString().split('T')[0];
    
    // 과거 날짜는 클릭 불가
    if (clickedDate < today) {
      alert('과거 날짜에는 스케쥴을 등록할 수 없습니다.');
      return;
    }

    setSelectedDate(clickedDate);
    setModalMode('create');
    setSelectedSchedule(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (info: any) => {
    const schedule = info.event.extendedProps.schedule;
    setSelectedSchedule(schedule);
    setIsDetailModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsDetailModalOpen(false);
    setSelectedSchedule(null);
    setSelectedDate('');
  };

  const handleScheduleSubmit = (formData: any) => {
    if (modalMode === 'create') {
      onScheduleCreate(formData);
    } else {
      onScheduleUpdate(selectedSchedule!.id, formData);
    }
    handleModalClose();
  };

  const handleScheduleEdit = (schedule: Schedule) => {
    const today = new Date().toISOString().split('T')[0];
    
    // 과거 날짜는 수정 불가
    if (schedule.date < today) {
      alert('과거 날짜의 스케쥴은 수정할 수 없습니다.');
      return;
    }

    setSelectedSchedule(schedule);
    setModalMode('edit');
    setIsDetailModalOpen(false);
    setIsModalOpen(true);
  };

  const handleScheduleDelete = (schedule: Schedule, options: any) => {
    const today = new Date().toISOString().split('T')[0];
    
    // 과거 날짜는 삭제 불가
    if (schedule.date < today) {
      alert('과거 날짜의 스케쥴은 삭제할 수 없습니다.');
      return;
    }

    onScheduleDelete(schedule.id, options);
    handleModalClose();
  };

  return (
    <div className="h-full bg-white">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">스케쥴 관리</h1>
        
        <div className="bg-white rounded-lg shadow border">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={calendarEvents}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            height="auto"
            locale="ko"
            buttonText={{
              today: '오늘',
              month: '월',
              week: '주',
              day: '일'
            }}
            dayCellClassNames={(info) => {
              const today = new Date().toISOString().split('T')[0];
              const cellDate = info.dateStr;
              return cellDate < today ? 'fc-day-past' : '';
            }}
          />
        </div>
      </div>

      {/* 스케쥴 생성/수정 모달 */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleScheduleSubmit}
        mode={modalMode}
        selectedDate={selectedDate}
        selectedSchedule={selectedSchedule}
      />

      {/* 스케쥴 상세 조회 모달 */}
      <ScheduleDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleModalClose}
        schedule={selectedSchedule}
        onEdit={handleScheduleEdit}
        onDelete={handleScheduleDelete}
        onStudentClick={onStudentClick}
      />
    </div>
  );
};

export default ScheduleCalendar; 