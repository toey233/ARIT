import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import CourseManage from './pages/CourseManage';
import MyRegistrations from './pages/MyRegistrations';
import RegistrationManage from './pages/RegistrationManage';
import Evaluation from './pages/Evaluation';
import EvaluationResults from './pages/EvaluationResults';
import Certificates from './pages/Certificates';
import CertificateManage from './pages/CertificateManage';
import News from './pages/News';
import NewsManage from './pages/NewsManage';
import UserManage from './pages/UserManage';
import Reports from './pages/Reports';
import Help from './pages/Help';

function LayoutWrapper({ children }) {
    return (
        <ProtectedRoute>
            <Layout>{children}</Layout>
        </ProtectedRoute>
    );
}

export default function App() {
    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#1e293b',
                        color: '#e2e8f0',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                    },
                    success: { iconTheme: { primary: '#10b981', secondary: '#1e293b' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
                }}
            />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/dashboard" element={<LayoutWrapper><Dashboard /></LayoutWrapper>} />
                <Route path="/courses" element={<LayoutWrapper><Courses /></LayoutWrapper>} />
                <Route path="/courses/:id" element={<LayoutWrapper><CourseDetail /></LayoutWrapper>} />
                <Route path="/my-registrations" element={<LayoutWrapper><MyRegistrations /></LayoutWrapper>} />
                <Route path="/certificates" element={<LayoutWrapper><Certificates /></LayoutWrapper>} />
                <Route path="/evaluation/:courseId" element={<LayoutWrapper><Evaluation /></LayoutWrapper>} />
                <Route path="/news" element={<LayoutWrapper><News /></LayoutWrapper>} />
                <Route path="/help" element={<LayoutWrapper><Help /></LayoutWrapper>} />

                {/* Staff / Admin routes */}
                <Route path="/course-manage" element={
                    <ProtectedRoute roles={['staff', 'admin']}><Layout><CourseManage /></Layout></ProtectedRoute>
                } />
                <Route path="/registration-manage" element={
                    <ProtectedRoute roles={['staff', 'admin']}><Layout><RegistrationManage /></Layout></ProtectedRoute>
                } />
                <Route path="/evaluation-results" element={
                    <ProtectedRoute roles={['staff', 'admin']}><Layout><EvaluationResults /></Layout></ProtectedRoute>
                } />
                <Route path="/certificate-manage" element={
                    <ProtectedRoute roles={['staff', 'admin']}><Layout><CertificateManage /></Layout></ProtectedRoute>
                } />
                <Route path="/news-manage" element={
                    <ProtectedRoute roles={['staff', 'admin']}><Layout><NewsManage /></Layout></ProtectedRoute>
                } />

                {/* Admin only routes */}
                <Route path="/user-manage" element={
                    <ProtectedRoute roles={['admin']}><Layout><UserManage /></Layout></ProtectedRoute>
                } />
                <Route path="/reports" element={
                    <ProtectedRoute roles={['admin']}><Layout><Reports /></Layout></ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}
