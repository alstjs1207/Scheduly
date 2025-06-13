import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useParams } from "react-router-dom";
import StudentList from "./components/studentList";
import StudentCreate from "./components/studentCreate";
import StudentEdit from "./components/studentEdit";
import StudentDetail from "./components/studentDetail";
import SchedulePage from "./components/schedule/SchedulePage";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Scheduly - 수강생 관리 시스템</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">수강생 관리</h2>
            <p className="text-gray-600 mb-4">수강생 정보를 등록, 수정, 조회할 수 있습니다.</p>
            <a 
              href="/students"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              수강생 목록
            </a>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">스케쥴 관리</h2>
            <p className="text-gray-600 mb-4">수강생들의 수업 스케쥴을 관리할 수 있습니다.</p>
            <a 
              href="/schedules"
              className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              스케쥴 관리
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentEditWrapper: React.FC = () => {
  const { id } = useParams();
  return <StudentEdit studentId={Number(id)} />;
};

const StudentDetailWrapper: React.FC = () => {
  const { id } = useParams();
  return <StudentDetail studentId={Number(id)} />;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/students" element={<StudentList />} />
        <Route path="/students/create" element={<StudentCreate />} />
        <Route path="/students/:id/edit" element={<StudentEditWrapper />} />
        <Route path="/students/:id" element={<StudentDetailWrapper />} />
        <Route path="/schedules" element={<SchedulePage />} />
      </Routes>
    </Router>
  );
};

export default App;
