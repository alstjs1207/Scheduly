import React, { useEffect, useState } from "react";
import axios from "axios";

interface Student {
  id: number;
  name: string;
  state: string;
  type: string;
  region: string;
  age: number;
  description: string;
  startDate: string;
  endDate: string;
  parentInfo: string;
  phoneNumber: string;
}

const StudentDetail: React.FC<{ studentId: number }> = ({ studentId }) => {
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await axios.get<Student>(`/api/students/${studentId}`);
        setStudent(response.data);
      } catch (err) {
        alert("수강생 정보를 불러오는 데 실패했습니다.");
      }
    };

    fetchStudent();
  }, [studentId]);

  if (!student) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">수강생 상세 정보</h2>
      <p>ID: {student.id}</p>
      <p>이름: {student.name}</p>
      <p>상태: {student.state}</p>
      <p>유형: {student.type}</p>
      <p>지역: {student.region}</p>
      <p>나이: {student.age}</p>
      <p>설명: {student.description}</p>
      <p>수업 시작일: {student.startDate}</p>
      <p>수업 종료일: {student.endDate}</p>
      <p>학부모 정보: {student.parentInfo}</p>
      <p>전화번호: {student.phoneNumber}</p>
    </div>
  );
};

export default StudentDetail;
