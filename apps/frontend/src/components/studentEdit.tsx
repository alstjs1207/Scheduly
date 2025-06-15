import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

// HTML date input을 위한 YYYY-MM-DD 형식
const formatDateForInput = (dateString: string | undefined): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

// API 요청을 위한 ISO 형식
const formatDateForAPI = (dateString: string | undefined): string | undefined => {
  if (!dateString) return undefined;
  return new Date(dateString).toISOString();
};

interface Student {
  id?: number;
  name?: string;
  state?: string;
  type?: string;
  region?: string;
  age?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  parentInfo?: string;
  phoneNumber?: string;
}

const typeOptions = [
  { value: "EXAMINEE", label: "입시생" },
  { value: "DROPPER", label: "재수생" },
  { value: "ADULT", label: "성인 수강생" },
];

const stateOptions = [
  { value: "NORMAL", label: "정상" },
  { value: "GRADUATE", label: "졸업" },
  { value: "DELETED", label: "탈퇴" },
];

const StudentEdit: React.FC<{ studentId: number }> = ({ studentId }) => {
  const [formData, setFormData] = useState<Student | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await axios.get<Student>(`/api/students/${studentId}`);
        // 날짜 데이터를 input type="date"에서 사용할 수 있는 형식으로 변환
        const formattedData = {
          ...response.data,
          startDate: formatDateForInput(response.data.startDate),
          endDate: formatDateForInput(response.data.endDate)
        };
        setFormData(formattedData);
      } catch (err) {
        alert("수강생 정보를 불러오는 데 실패했습니다.");
      }
    };

    fetchStudent();
  }, [studentId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (formData) {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: name === "endDate" && value === "" ? null : value, // endDate가 빈 문자열이면 null로 설정
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    
    try {
      const { endDate, startDate, ...data } = formData;
      
      const payload = {
        ...data,
        startDate: formatDateForAPI(startDate),
        ...(endDate ? { endDate: formatDateForAPI(endDate) } : {})
      };
      
      await axios.put(`/api/students/${studentId}`, payload);
      alert("수강생 정보가 성공적으로 수정되었습니다.");
      navigate("/students");
    } catch (err) {
      alert("수강생 정보 수정에 실패했습니다.");
    }
  };

  const handleCancel = () => {
    navigate("/students");
  };

  if (!formData) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">수강생 정보 수정</h1>
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
        <form onSubmit={handleSubmit} className="p-4 bg-white shadow-md rounded-lg">
          <h2 className="text-xl font-bold mb-4">수강생 수정</h2>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            className="block w-full mb-2 p-2 border rounded" 
            placeholder="이름"
            required 
          />
          <select name="state" value={formData.state} onChange={handleChange} className="block w-full mb-2 p-2 border rounded">
            {stateOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select name="type" value={formData.type} onChange={handleChange} className="block w-full mb-2 p-2 border rounded">
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input 
            type="text" 
            name="region" 
            value={formData.region} 
            onChange={handleChange} 
            className="block w-full mb-2 p-2 border rounded" 
            placeholder="지역"
          />
          <input 
            type="number" 
            name="age" 
            value={formData.age} 
            onChange={handleChange} 
            className="block w-full mb-2 p-2 border rounded" 
            placeholder="나이"
          />
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            className="block w-full mb-2 p-2 border rounded" 
            placeholder="설명"
          />
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">수업 시작일</label>
            <input 
              type="date" 
              name="startDate" 
              value={formData.startDate} 
              onChange={handleChange} 
              className="block w-full p-2 border rounded" 
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">수업 종료일</label>
            <input 
              type="date" 
              name="endDate" 
              value={formData.endDate} 
              onChange={handleChange} 
              className="block w-full p-2 border rounded" 
            />
          </div>
          <input 
            type="text" 
            name="parentInfo" 
            value={formData.parentInfo} 
            onChange={handleChange} 
            className="block w-full mb-2 p-2 border rounded" 
            placeholder="학부모 정보"
          />
          <input 
            type="text" 
            name="phoneNumber" 
            value={formData.phoneNumber} 
            onChange={handleChange} 
            className="block w-full mb-2 p-2 border rounded" 
            placeholder="전화번호"
          />
          <div className="flex justify-end space-x-2">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">수정</button>
            <button type="button" onClick={handleCancel} className="bg-gray-500 text-white px-4 py-2 rounded">취소</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentEdit;
