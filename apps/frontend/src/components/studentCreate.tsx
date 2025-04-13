import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // 추가

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
      const { endDate, ...data } = formData;
      const payload = endDate ? formData : data;
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
      <input
        type="tel"
        name="phoneNumber"
        placeholder="전화번호 (숫자만 입력)"
        value={formData.phoneNumber}
        onChange={handleChange}
        className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        pattern="[0-9]{10,11}"
        required
      />
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

