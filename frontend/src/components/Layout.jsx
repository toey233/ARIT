import { useState } from 'react';
import NotificationDropdown from './NotificationDropdown';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    HiOutlineHome, HiOutlineAcademicCap, HiOutlineClipboardList,
    HiOutlineStar, HiOutlineDocumentText, HiOutlineNewspaper,
    HiOutlineChartBar, HiOutlineUsers, HiOutlineCog,
    HiOutlineQuestionMarkCircle, HiOutlineLogout, HiOutlineMenu,
    HiOutlineX, HiOutlineUserCircle, HiOutlineExclamation
} from 'react-icons/hi';

const userMenuItems = [
    { path: '/dashboard', label: 'หน้าหลัก', icon: HiOutlineHome },
    { path: '/courses', label: 'หลักสูตรอบรม', icon: HiOutlineAcademicCap },
    { path: '/my-registrations', label: 'การลงทะเบียนของฉัน', icon: HiOutlineClipboardList },
    { path: '/certificates', label: 'ประกาศนียบัตร', icon: HiOutlineDocumentText },
    { path: '/news', label: 'ข่าวสาร/ประกาศ', icon: HiOutlineNewspaper },
    { path: '/help', label: 'คู่มือการใช้งาน', icon: HiOutlineQuestionMarkCircle },
];

const staffMenuItems = [
    { path: '/dashboard', label: 'หน้าหลัก', icon: HiOutlineHome },
    { path: '/courses', label: 'หลักสูตรอบรม', icon: HiOutlineAcademicCap },
    { path: '/course-manage', label: 'จัดการหลักสูตร', icon: HiOutlineCog },
    { path: '/registration-manage', label: 'จัดการลงทะเบียน', icon: HiOutlineClipboardList },
    { path: '/evaluation-results', label: 'ผลการประเมิน', icon: HiOutlineStar },
    { path: '/certificate-manage', label: 'ออกประกาศนียบัตร', icon: HiOutlineDocumentText },
    { path: '/news-manage', label: 'จัดการข่าวสาร', icon: HiOutlineNewspaper },
    { path: '/help', label: 'คู่มือการใช้งาน', icon: HiOutlineQuestionMarkCircle },
];

const adminMenuItems = [
    { path: '/dashboard', label: 'หน้าหลัก', icon: HiOutlineHome },
    { path: '/courses', label: 'หลักสูตรอบรม', icon: HiOutlineAcademicCap },
    { path: '/course-manage', label: 'จัดการหลักสูตร', icon: HiOutlineCog },
    { path: '/registration-manage', label: 'จัดการลงทะเบียน', icon: HiOutlineClipboardList },
    { path: '/evaluation-results', label: 'ผลการประเมิน', icon: HiOutlineStar },
    { path: '/certificate-manage', label: 'ออกประกาศนียบัตร', icon: HiOutlineDocumentText },
    { path: '/news-manage', label: 'จัดการข่าวสาร', icon: HiOutlineNewspaper },
    { path: '/user-manage', label: 'จัดการผู้ใช้', icon: HiOutlineUsers },
    { path: '/reports', label: 'รายงาน/สถิติ', icon: HiOutlineChartBar },
    { path: '/help', label: 'คู่มือการใช้งาน', icon: HiOutlineQuestionMarkCircle },
];

function getRoleLabel(role) {
    switch (role) {
        case 'admin': return 'ผู้ดูแลระบบ';
        case 'staff': return 'เจ้าหน้าที่';
        default: return 'ผู้ใช้งาน';
    }
}

function getRoleBadgeClass(role) {
    switch (role) {
        case 'admin': return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'staff': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
}

export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = user?.role === 'admin' ? adminMenuItems : user?.role === 'staff' ? staffMenuItems : userMenuItems;

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        setShowLogoutConfirm(false);
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen flex bg-transparent">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl border-r border-surface-200/60 shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                {/* Logo */}
                <div className="p-6 border-b border-surface-200/60">
                    <div className="flex items-center gap-3">
                        <div style={{ display: 'flex', alignItems: 'center', height: 40 }}>
                            <img 
                                src="/logo.png" 
                                alt="Logo" 
                                style={{ height: '100%', width: 'auto', objectFit: 'contain', display: 'block' }}
                                onError={(e) => { 
                                    e.target.style.display='none'; 
                                    e.target.nextSibling.style.display='flex'; 
                                }} 
                            />
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-glow" style={{ display: 'none' }}>
                                A
                            </div>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-surface-900 leading-tight">ARIT Training</h1>
                            <p className="text-xs text-surface-500">ระบบจัดการอบรม</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-sm'
                                    : 'text-surface-700 hover:text-primary-700 hover:bg-surface-50'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-700' : 'text-surface-500 group-hover:text-primary-700'} transition-colors`} />
                                <span className="font-semibold text-sm">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top Bar */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-surface-200/60 px-6 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-lg text-surface-500 hover:text-primary-600 hover:bg-surface-50 transition-colors"
                            >
                                <HiOutlineMenu className="w-6 h-6" />
                            </button>
                            <div>
                                <h2 className="text-lg font-semibold text-surface-900">
                                    {menuItems.find(item => item.path === location.pathname)?.label || 'ระบบจัดการอบรม'}
                                </h2>
                                <p className="text-xs text-surface-500">สำนักวิทยบริการและเทคโนโลยีสารสนเทศ</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <NotificationDropdown />
                            <Link to="/profile" className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-surface-50 transition-colors cursor-pointer group border border-transparent hover:border-surface-200">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg shadow-sm border-2 border-white shrink-0 overflow-hidden" style={{ padding: 0 }}>
                                    <img 
                                        src={user?.profilePicture || "/default-avatar.png"} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover" 
                                        style={{ display: 'block' }}
                                        onError={(e) => { 
                                            e.target.style.display='none'; 
                                            e.target.nextSibling.style.display='flex'; 
                                        }} 
                                    />
                                    <div style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                        {user?.firstName?.charAt(0) || 'U'}
                                    </div>
                                </div>
                                <div className="hidden sm:flex flex-col min-w-0 items-start text-left">
                                    <p className="text-sm font-medium text-surface-900 truncate leading-tight">{user?.firstName} {user?.lastName}</p>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getRoleBadgeClass(user?.role)} bg-white mt-0.5`}>
                                        {getRoleLabel(user?.role)}
                                    </span>
                                </div>
                            </Link>

                            <button
                                onClick={handleLogout}
                                title="ออกจากระบบ"
                                className="flex items-center justify-center w-10 h-10 rounded-xl text-surface-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 hover:shadow-sm border border-transparent hover:border-red-100"
                            >
                                <HiOutlineLogout className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>

            {/* ===== Logout Confirmation Modal ===== */}
            {showLogoutConfirm && (
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                        zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
                    }}
                    onClick={() => setShowLogoutConfirm(false)}
                >
                    <div
                        style={{
                            position: 'relative', overflow: 'hidden',
                            background: 'linear-gradient(145deg, #ffffff 0%, #fff8f6 100%)',
                            borderRadius: 24, padding: '48px 36px 40px', textAlign: 'center',
                            maxWidth: 400, width: '88%',
                            boxShadow: '0 30px 90px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
                            animation: 'logoutPopIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Top gradient bar */}
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: 5,
                            background: 'linear-gradient(90deg, #f59e0b, #ef4444, #f59e0b)',
                        }} />

                        {/* Glow behind icon */}
                        <div style={{
                            position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)',
                            width: 180, height: 180, borderRadius: '50%', opacity: 0.12,
                            background: 'radial-gradient(circle, #f59e0b, transparent 70%)',
                        }} />

                        {/* Icon */}
                        <div style={{
                            width: 88, height: 88, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 20px',
                            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                            boxShadow: '0 8px 32px rgba(245,158,11,0.35)',
                            animation: 'logoutIconBounce 0.6s ease 0.2s both',
                        }}>
                            <HiOutlineExclamation size={48} color="#fff" />
                        </div>

                        {/* Title */}
                        <div style={{
                            fontSize: 24, fontWeight: 800, marginBottom: 10, letterSpacing: '-0.5px',
                            background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            ⚠️ ออกจากระบบ
                        </div>

                        {/* Message */}
                        <div style={{ fontSize: 15, color: '#777', marginBottom: 28, lineHeight: 1.6, padding: '0 8px' }}>
                            คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <button
                                style={{
                                    padding: '14px 32px', borderRadius: 14, border: '2px solid #e5e7eb',
                                    cursor: 'pointer', fontSize: 16, fontWeight: 700, color: '#666',
                                    background: '#fff', minWidth: 130,
                                    transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                                }}
                                onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.borderColor = '#ccc'; }}
                                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.borderColor = '#e5e7eb'; }}
                                onClick={() => setShowLogoutConfirm(false)}
                            >
                                ยกเลิก
                            </button>
                            <button
                                style={{
                                    padding: '14px 32px', borderRadius: 14, border: 'none',
                                    cursor: 'pointer', fontSize: 16, fontWeight: 700, color: '#fff',
                                    background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
                                    boxShadow: '0 6px 24px rgba(239,68,68,0.4)',
                                    minWidth: 130,
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                }}
                                onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; }}
                                onClick={confirmLogout}
                            >
                                ออกจากระบบ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CSS Animations */}
            <style>{`
                @keyframes logoutPopIn {
                    0% { transform: scale(0.5); opacity: 0; }
                    60% { transform: scale(1.05); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes logoutIconBounce {
                    0% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1.2); }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
