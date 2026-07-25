// นำเข้าไลบรารีและคอมโพเนนต์ที่จำเป็นสำหรับการจัดการ Routing (เส้นทางหน้าเว็บ)
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CourseDetail from './pages/CourseDetail';
import MyRegistrations from './pages/MyRegistrations';
import Certificates from './pages/Certificates';
import CourseManage from './pages/CourseManage';
import RegistrationManage from './pages/RegistrationManage';
import Evaluation from './pages/Evaluation';
import EvaluationResults from './pages/EvaluationResults';
import CertificateManage from './pages/CertificateManage';
import News from './pages/News';
import NewsManage from './pages/NewsManage';
import UserManage from './pages/UserManage';
import Reports from './pages/Reports';
import Help from './pages/Help';
import Profile from './pages/Profile';
import Transcript from './pages/Transcript';

// คอมโพเนนต์ครอบสำหรับหน้าของ Staff และ Admin ที่ต้องการ Layout เฉพาะ
function LayoutWrapper({ children }) {
    return (
        <ProtectedRoute roles={['staff', 'admin']}>
            <Layout>{children}</Layout>
        </ProtectedRoute>
    );
}

// คอมโพเนนต์หลักที่ควบคุมเส้นทาง (Routes) ทั้งหมดของแอปพลิเคชัน
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
            {/* กำหนดเส้นทาง (Routes) หน้าเว็บทั้งหมดในระบบ */}
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                <Route path="/dashboard" element={<LayoutWrapper><Dashboard /></LayoutWrapper>} />
                <Route path="/courses" element={<LayoutWrapper><Courses /></LayoutWrapper>} />
                <Route path="/courses/:id" element={<LayoutWrapper><CourseDetail /></LayoutWrapper>} />
                
                {/* User specific pages without layout */}
                <Route path="/my-registrations" element={
                    <ProtectedRoute><MyRegistrations /></ProtectedRoute>
                } />
                <Route path="/certificates" element={
                    <ProtectedRoute><Certificates /></ProtectedRoute>
                } />

                <Route path="/evaluation/:courseId" element={<LayoutWrapper><Evaluation /></LayoutWrapper>} />
                <Route path="/news" element={<LayoutWrapper><News /></LayoutWrapper>} />
                <Route path="/help" element={<LayoutWrapper><Help /></LayoutWrapper>} />
                <Route path="/profile" element={<LayoutWrapper><Profile /></LayoutWrapper>} />
                <Route path="/transcript" element={<ProtectedRoute><Transcript /></ProtectedRoute>} />

                {/* เส้นทางสำหรับเจ้าหน้าที่ (Staff) และผู้ดูแลระบบ (Admin) เท่านั้น */}
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

                {/* เส้นทางสำหรับผู้ดูแลระบบ (Admin) เท่านั้น */}
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
