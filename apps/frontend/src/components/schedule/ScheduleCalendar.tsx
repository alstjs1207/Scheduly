import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';
import { Schedule } from '../../types/schedule';
import ScheduleModal from './ScheduleModal';
import ScheduleDetailModal from './ScheduleDetailModal';
import { useNavigate } from 'react-router-dom';

interface ScheduleCalendarProps {
  schedules: Schedule[];
  onScheduleCreate: (schedule: any) => void;
  onScheduleUpdate: (id: string, schedule: any) => void;
  onScheduleDelete: (id: string, options: any) => void;
  onStudentClick: (studentId: number) => void;
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  schedules,
  onScheduleCreate,
  onScheduleUpdate,
  onScheduleDelete,
  onStudentClick
}) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // ISO 날짜 문자열을 YYYY-MM-DD 형식으로 변환하는 함수
  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // FullCalendar 이벤트 형식으로 변환
  const calendarEvents = schedules.map(schedule => {
    const startDateTime = `${formatDate(schedule.date)}T${schedule.startTime}`;
    const endDateTime = `${formatDate(schedule.date)}T${schedule.endTime}`;
    
    return {
      id: schedule.id,
      title: `${schedule.student.name}`,
      start: startDateTime,
      end: endDateTime,
      backgroundColor: schedule.student.color,
      borderColor: schedule.student.color,
      allDay: false,
      extendedProps: {
        schedule: {
          ...schedule,
          studentName: schedule.student.name
        }
      }
    };
  });

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

  const handleScheduleDelete = (schedule: Schedule, options: { deleteType: 'single' | 'future' }) => {
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">스케쥴 관리</h1>
          <button
            onClick={() => navigate('/')}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            홈으로
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow border">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin]}
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
            timeZone="Asia/Seoul"
            slotMinTime="06:00:00"
            slotMaxTime="24:00:00"
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