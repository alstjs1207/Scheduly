import React, { useState, useEffect } from 'react';
import { Student } from '../../types/schedule';
import { getStudents } from '../../api/student';

interface StudentSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (student: Student) => void;
}

const StudentSearchModal: React.FC<StudentSearchModalProps> = ({
  isOpen,
  onClose,
  onSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchStudents();
      setSearchTerm('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.region.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await getStudents({ state: 'NORMAL' });
      setStudents(response);
      setFilteredStudents(response);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (student: Student) => {
    onSelect(student);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'EXAMINEE': return '입시생';
      case 'DROPPER': return '재수생';
      case 'ADULT': return '성인';
      default: return type;
    }
  };

  const getStateLabel = (state: string) => {
    switch (state) {
      case 'NORMAL': return '정상';
      case 'GRADUATE': return '졸업';
      case 'DELETED': return '탈퇴';
      default: return state;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">수강생 검색</h2>
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

        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="이름 또는 지역으로 검색"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? '검색 결과가 없습니다.' : '등록된 수강생이 없습니다.'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStudents.map(student => (
                <div
                  key={student.id}
                  onClick={() => handleStudentSelect(student)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {student.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {student.region} · {getTypeLabel(student.type)}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {getStateLabel(student.state)}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>{student.description || '설명 없음'}</p>
                    <p className="mt-1">
                      {student.parentInfo ? `보호자: ${student.parentInfo}` : ''}
                      {student.phoneNumber ? ` · 연락처: ${student.phoneNumber}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentSearchModal; 