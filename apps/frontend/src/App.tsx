import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useParams } from "react-router-dom";
import App from "./App";
import StudentList from "./components/studentList";
import StudentCreate from "./components/studentCreate";
import StudentEdit from "./components/studentEdit";
import StudentDetail from "./components/studentDetail";

const StudentEditWrapper: React.FC = () => {
  const { id } = useParams();
  return <StudentEdit studentId={Number(id)} />;
};

const StudentDetailWrapper: React.FC = () => {
  const { id } = useParams();
  return <StudentDetail studentId={Number(id)} />;
};

const Root: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/students" element={<StudentList />} />
        <Route path="/students/create" element={<StudentCreate />} />
        <Route path="/students/:id/edit" element={<StudentEditWrapper />} />
        <Route path="/students/:id" element={<StudentDetailWrapper />} />
      </Routes>
    </Router>
  );
};

export default Root;
