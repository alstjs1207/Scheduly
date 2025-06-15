import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Header from './components/Header';
import StudentList from "./components/studentList";
import StudentCreate from "./components/studentCreate";
import StudentEdit from "./components/studentEdit";
import StudentDetail from "./components/studentDetail";
import SchedulePage from "./components/schedule/SchedulePage";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">수강생 관리</h2>
            <p className="text-gray-600 mb-4">수강생 정보를 등록, 수정, 조회할 수 있습니다.</p>
            <Link 
              to="/students"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              수강생 목록
            </Link>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">스케쥴 관리</h2>
            <p className="text-gray-600 mb-4">수강생들의 수업 스케쥴을 관리할 수 있습니다.</p>
            <Link 
              to="/schedules"
              className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              스케쥴 관리
            </Link>
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
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/students"
            element={
              <ProtectedRoute>
                <Layout>
                  <StudentList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/students/create"
            element={
              <ProtectedRoute>
                <Layout>
                  <StudentCreate />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/students/:id/edit"
            element={
              <ProtectedRoute>
                <Layout>
                  <StudentEditWrapper />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/students/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <StudentDetailWrapper />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedules"
            element={
              <ProtectedRoute>
                <Layout>
                  <SchedulePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Home />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
