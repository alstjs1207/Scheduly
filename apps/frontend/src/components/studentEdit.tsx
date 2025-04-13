import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Student {
  id?: number;
  name?: string;
  state?: string;
  type?: string;
  region?: string;
  age?: number;
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
        setFormData(response.data);
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
    try {
      await axios.put(`/api/students/${studentId}`, formData);
      alert("수강생 정보가 성공적으로 수정되었습니다.");
      navigate("/students"); // 목록으로 이동
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
    <form onSubmit={handleSubmit} className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">수강생 수정</h2>
      <input type="text" name="name" value={formData.name} onChange={handleChange} className="block w-full mb-2 p-2 border rounded" required />
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
      <input type="text" name="region" value={formData.region} onChange={handleChange} className="block w-full mb-2 p-2 border rounded" />
      <input type="number" name="age" value={formData.age} onChange={handleChange} className="block w-full mb-2 p-2 border rounded" />
      <textarea name="description" value={formData.description} onChange={handleChange} className="block w-full mb-2 p-2 border rounded" />
      <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="block w-full mb-2 p-2 border rounded" />
      <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="block w-full mb-2 p-2 border rounded" />
      <input type="text" name="parentInfo" value={formData.parentInfo} onChange={handleChange} className="block w-full mb-2 p-2 border rounded" />
      <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="block w-full mb-2 p-2 border rounded" />
      <div className="flex justify-end space-x-2">
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">수정</button>
        <button type="button" onClick={handleCancel} className="bg-gray-500 text-white px-4 py-2 rounded">취소</button>
      </div>
    </form>
  );
};

export default StudentEdit;
