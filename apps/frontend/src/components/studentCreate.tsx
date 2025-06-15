import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // 추가
import { generateRandomColor, hslToHex } from "../utils/colorUtils";

const StudentCreate: React.FC = () => {
  const navigate = useNavigate(); // 추가
  const [formData, setFormData] = useState({
    name: "",
    state: "NORMAL",
    type: "EXAMINEE",
    region: "",
    age: "",
    description: "",
    startDate: "",
    endDate: "",
    parentInfo: "",
    phoneNumber: "",
    color: "#3B82F6",
  });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { endDate, startDate, ...data } = formData;
      
      // ISO-8601 형식으로 날짜 변환
      const payload = {
        ...data,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        ...(endDate ? { endDate: new Date(endDate).toISOString() } : {})
      };
      
      await axios.post("/api/students", payload);
      alert("수강생이 성공적으로 등록되었습니다.");
      setFormData({
        name: "",
        state: "NORMAL",
        type: "EXAMINEE",
        region: "",
        age: "",
        description: "",
        startDate: "",
        endDate: "",
        parentInfo: "",
        phoneNumber: "",
        color: "#3B82F6",
      });
      navigate("/students"); // 목록 화면으로 이동
    } catch (err) {
      alert("수강생 등록에 실패했습니다.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white shadow-md rounded-lg space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">수강생 등록</h2>
      <input
        type="text"
        name="name"
        placeholder="이름"
        value={formData.name}
        onChange={handleChange}
        className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        required
      />
      <select
        name="state"
        value={formData.state}
        onChange={handleChange}
        className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      >
        {stateOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select
        name="type"
        value={formData.type}
        onChange={handleChange}
        className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      >
        {typeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <input
        type="text"
        name="region"
        placeholder="지역"
        value={formData.region}
        onChange={handleChange}
        className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        required
      />
      <input
        type="number"
        name="age"
        placeholder="나이"
        value={formData.age}
        onChange={handleChange}
        className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        required
      />
      <textarea
        name="description"
        placeholder="설명"
        value={formData.description}
        onChange={handleChange}
        className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      />
      <label className="block text-gray-700 font-medium mb-1">강의 시작일</label>
      <input
        type="date"
        name="startDate"
        value={formData.startDate}
        onChange={handleChange}
        className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        required
      />
      <label className="block text-gray-700 font-medium mb-1">강의 종료일</label>
      <input
        type="date"
        name="endDate"
        value={formData.endDate}
        onChange={handleChange}
        className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      />
      <input
        type="text"
        name="parentInfo"
        placeholder="학부모 정보"
        value={formData.parentInfo}
        onChange={handleChange}
        className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      />
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
        <input 
          type="text" 
          name="phoneNumber" 
          value={formData.phoneNumber} 
          onChange={handleChange} 
          className="block w-full p-2 border rounded" 
          placeholder="전화번호"
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">스케줄 색상</label>
        <div className="flex gap-2 items-center">
          <input 
            type="color" 
            name="color" 
            value={formData.color || "#3B82F6"} 
            onChange={handleChange} 
            className="w-20 h-10 p-1 border rounded" 
          />
          <button
            type="button"
            onClick={() => {
              const randomColor = generateRandomColor();
              setFormData(prev => ({ ...prev, color: hslToHex(randomColor) }));
            }}
            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            랜덤 색상
          </button>
        </div>
      </div>
      <div className="flex justify-between">
        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
        >
          등록
        </button>
        <button
          type="button"
          onClick={() => navigate("/students")}
          className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition"
        >
          취소
        </button>
      </div>
    </form>
  );
};

export default StudentCreate;

