import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface Student {
  id: number;
  name: string;
  state: string;
  type: string;
  region: string;
  age?: number;
  description?: string;
  startDate?: string;
  endDate?: string;
  parentInfo?: string;
  phoneNumber?: string;
}

const typeMapping: Record<string, string> = {
  EXAMINEE: "입시생",
  DROPPER: "재수생",
  ADULT: "성인 수강생",
};

const stateMapping: Record<string, string> = {
  NORMAL: "정상",
  GRADUATE: "졸업",
  DELETED: "탈퇴",
};

const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get<Student[]>("/api/students");
        setStudents(response.data);
      } catch (err) {
        setError("수강생 데이터를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const openModal = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedStudent(null);
    setIsModalOpen(false);
  };

  const handleCreateStudent = () => {
    navigate("/students/create");
  };

  const handleEditStudent = (studentId: number) => {
    navigate(`/students/${studentId}/edit`);
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (window.confirm("정말로 이 수강생을 삭제하시겠습니까?")) {
      try {
        await axios.delete(`/api/students/${studentId}`);
        alert("수강생이 삭제되었습니다.");
        closeModal();
        setStudents((prev) => prev.filter((student) => student.id !== studentId));
      } catch (err) {
        alert("수강생 삭제에 실패했습니다.");
      }
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500">로딩 중...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">수강생 목록</h1>
        <button
          onClick={handleCreateStudent}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          수강생 등록
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {students.map((student) => (
          <div
            key={student.id}
            className="p-4 bg-white shadow-md rounded-lg cursor-pointer hover:shadow-lg"
            onClick={() => openModal(student)}
          >
            <p className="text-lg font-medium">이름: {student.name}</p>
            <p className="text-sm text-gray-500">상태: {stateMapping[student.state]}</p>
            <p className="text-sm text-gray-500">유형: {typeMapping[student.type]}</p>
            <p className="text-sm text-gray-500">지역: {student.region}</p>
          </div>
        ))}
      </div>

      {isModalOpen && selectedStudent && (
        <div
          className="bg-black/40 fixed inset-0 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl w-96">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              수강생 상세 정보
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <p className="font-medium text-gray-700 dark:text-gray-300">ID:</p>
              <p className="text-gray-900 dark:text-gray-100">{selectedStudent.id}</p>
              <p className="font-medium text-gray-700 dark:text-gray-300">이름:</p>
              <p className="text-gray-900 dark:text-gray-100">{selectedStudent.name}</p>
              <p className="font-medium text-gray-700 dark:text-gray-300">상태:</p>
              <span
                className={`px-2 py-1 rounded-full text-white text-sm ${
                  selectedStudent.state === "NORMAL"
                    ? "bg-green-500"
                    : selectedStudent.state === "GRADUATE"
                    ? "bg-blue-500"
                    : "bg-red-500"
                }`}
              >
                {stateMapping[selectedStudent.state]}
              </span>
              <p className="font-medium text-gray-700 dark:text-gray-300">유형:</p>
              <span
                className={`px-2 py-1 rounded-full text-white text-sm ${
                  selectedStudent.type === "EXAMINEE"
                    ? "bg-purple-500"
                    : selectedStudent.type === "DROPPER"
                    ? "bg-yellow-500"
                    : "bg-gray-500"
                }`}
              >
                {typeMapping[selectedStudent.type]}
              </span>
              <p className="font-medium text-gray-700 dark:text-gray-300">지역:</p>
              <p className="text-gray-900 dark:text-gray-100">{selectedStudent.region}</p>
              {selectedStudent.age && (
                <>
                  <p className="font-medium text-gray-700 dark:text-gray-300">나이:</p>
                  <p className="text-gray-900 dark:text-gray-100">{selectedStudent.age}</p>
                </>
              )}
              {selectedStudent.description && (
                <>
                  <p className="font-medium text-gray-700 dark:text-gray-300">설명:</p>
                  <p className="text-gray-900 dark:text-gray-100">{selectedStudent.description}</p>
                </>
              )}
              {selectedStudent.startDate && (
                <>
                  <p className="font-medium text-gray-700 dark:text-gray-300">수업 시작일:</p>
                  <p className="text-gray-900 dark:text-gray-100">{selectedStudent.startDate}</p>
                </>
              )}
              {selectedStudent.endDate && (
                <>
                  <p className="font-medium text-gray-700 dark:text-gray-300">수업 종료일:</p>
                  <p className="text-gray-900 dark:text-gray-100">{selectedStudent.endDate}</p>
                </>
              )}
              {selectedStudent.parentInfo && (
                <>
                  <p className="font-medium text-gray-700 dark:text-gray-300">학부모 정보:</p>
                  <p className="text-gray-900 dark:text-gray-100">{selectedStudent.parentInfo}</p>
                </>
              )}
              {selectedStudent.phoneNumber && (
                <>
                  <p className="font-medium text-gray-700 dark:text-gray-300">전화번호:</p>
                  <p className="text-gray-900 dark:text-gray-100">{selectedStudent.phoneNumber}</p>
                </>
              )}
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => handleEditStudent(selectedStudent.id)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                수정
              </button>
              <button
                onClick={() => handleDeleteStudent(selectedStudent.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded dark:bg-red-700 dark:hover:bg-red-600"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;
