import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { HiOutlineAcademicCap, HiOutlineClipboardList, HiOutlineDocumentText, HiOutlineNewspaper, HiOutlineUsers, HiOutlineChartBar, HiOutlineStar, HiOutlineClock } from 'react-icons/hi';

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [courses, setCourses] = useState([]);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [coursesRes, newsRes] = await Promise.all([
                api.get('/courses'),
                api.get('/news')
            ]);
            setCourses(coursesRes.data.slice(0, 4));
            setNews(newsRes.data.slice(0, 3));

            if (user?.role === 'admin') {
                const statsRes = await api.get('/reports/overview');
                setStats(statsRes.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <div className="glass-card p-8 bg-gradient-to-r from-primary-600/10 to-accent-600/10">
                <h1 className="text-2xl font-bold text-white mb-2">
                    สวัสดี, {user?.firstName} {user?.lastName} 👋
                </h1>
                <p className="text-surface-400">ยินดีต้อนรับสู่ระบบบริหารการจัดการอบรม สำนักวิทยบริการและเทคโนโลยีสารสนเทศ</p>
            </div>

            {/* Admin Stats */}
            {user?.role === 'admin' && stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link to="/user-manage" className="stat-card cursor-pointer hover:scale-105 transition-transform">
                        <div className="flex items-center gap-2 text-surface-400">
                            <HiOutlineUsers className="w-5 h-5 text-blue-400" />
                            <span className="text-sm">ผู้ใช้ทั้งหมด</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                    </Link>
                    <Link to="/course-manage" className="stat-card cursor-pointer hover:scale-105 transition-transform">
                        <div className="flex items-center gap-2 text-surface-400">
                            <HiOutlineAcademicCap className="w-5 h-5 text-emerald-400" />
                            <span className="text-sm">หลักสูตร</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.totalCourses}</p>
                    </Link>
                    <Link to="/registration-manage" className="stat-card cursor-pointer hover:scale-105 transition-transform">
                        <div className="flex items-center gap-2 text-surface-400">
                            <HiOutlineClipboardList className="w-5 h-5 text-amber-400" />
                            <span className="text-sm">ลงทะเบียน</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.totalRegistrations}</p>
                        {stats.pendingRegistrations > 0 && (
                            <span className="badge-warning text-xs">รออนุมัติ {stats.pendingRegistrations}</span>
                        )}
                    </Link>
                    <Link to="/reports" className="stat-card cursor-pointer hover:scale-105 transition-transform">
                        <div className="flex items-center gap-2 text-surface-400">
                            <HiOutlineStar className="w-5 h-5 text-yellow-400" />
                            <span className="text-sm">คะแนนเฉลี่ย</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.averageRating || '-'}</p>
                    </Link>
                </div>
            )}

            {/* Quick Actions */}
            <div>
                <h2 className="section-title mb-4">เมนูลัด</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link to="/courses" className="card flex flex-col items-center gap-3 text-center hover:scale-105">
                        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                            <HiOutlineAcademicCap className="w-6 h-6 text-primary-400" />
                        </div>
                        <span className="text-sm font-medium text-surface-300">หลักสูตรอบรม</span>
                    </Link>
                    {user?.role === 'user' && (
                        <Link to="/my-registrations" className="card flex flex-col items-center gap-3 text-center hover:scale-105">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                <HiOutlineClipboardList className="w-6 h-6 text-emerald-400" />
                            </div>
                            <span className="text-sm font-medium text-surface-300">การลงทะเบียน</span>
                        </Link>
                    )}
                    <Link to="/certificates" className="card flex flex-col items-center gap-3 text-center hover:scale-105">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <HiOutlineDocumentText className="w-6 h-6 text-amber-400" />
                        </div>
                        <span className="text-sm font-medium text-surface-300">ประกาศนียบัตร</span>
                    </Link>
                    <Link to="/news" className="card flex flex-col items-center gap-3 text-center hover:scale-105">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <HiOutlineNewspaper className="w-6 h-6 text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-surface-300">ข่าวสาร</span>
                    </Link>
                    {['staff', 'admin'].includes(user?.role) && (
                        <>
                            <Link to="/course-manage" className="card flex flex-col items-center gap-3 text-center hover:scale-105">
                                <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                                    <HiOutlineAcademicCap className="w-6 h-6 text-violet-400" />
                                </div>
                                <span className="text-sm font-medium text-surface-300">จัดการหลักสูตร</span>
                            </Link>
                            <Link to="/registration-manage" className="card flex flex-col items-center gap-3 text-center hover:scale-105">
                                <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center">
                                    <HiOutlineClipboardList className="w-6 h-6 text-rose-400" />
                                </div>
                                <span className="text-sm font-medium text-surface-300">จัดการลงทะเบียน</span>
                            </Link>
                        </>
                    )}
                    {user?.role === 'admin' && (
                        <Link to="/reports" className="card flex flex-col items-center gap-3 text-center hover:scale-105">
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                                <HiOutlineChartBar className="w-6 h-6 text-cyan-400" />
                            </div>
                            <span className="text-sm font-medium text-surface-300">รายงาน/สถิติ</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* Recent Courses */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="section-title">หลักสูตรล่าสุด</h2>
                    <Link to="/courses" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">ดูทั้งหมด →</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courses.map(course => (
                        <Link key={course.id} to={`/courses/${course.id}`} className="card group">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center shrink-0">
                                    <HiOutlineAcademicCap className="w-7 h-7 text-primary-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors truncate">{course.title}</h3>
                                    <p className="text-sm text-surface-400 mt-1 line-clamp-2">{course.description}</p>
                                    <div className="flex items-center gap-4 mt-3">
                                        <span className="flex items-center gap-1 text-xs text-surface-500">
                                            <HiOutlineClock className="w-3.5 h-3.5" />
                                            {formatDate(course.startDate)}
                                        </span>
                                        <span className="badge-info text-xs">{course.category}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent News */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="section-title">ข่าวสารล่าสุด</h2>
                    <Link to="/news" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">ดูทั้งหมด →</Link>
                </div>
                <div className="space-y-3">
                    {news.map(item => (
                        <div key={item.id} className="card flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                                <HiOutlineNewspaper className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-white text-sm truncate">{item.title}</h3>
                                <p className="text-xs text-surface-500 mt-0.5">{formatDate(item.createdAt)} · {item.category}</p>
                            </div>
                            {item.isPinned && <span className="badge-warning text-xs">ปักหมุด</span>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
