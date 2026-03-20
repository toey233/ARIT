import { useState, useEffect } from 'react';
import api from '../services/api';
import { HiOutlineChartBar, HiOutlineUsers, HiOutlineAcademicCap, HiOutlineClipboardList, HiOutlineStar, HiOutlineDocumentText } from 'react-icons/hi';

export default function Reports() {
    const [overview, setOverview] = useState(null);
    const [courseStats, setCourseStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/reports/overview'),
            api.get('/reports/courses')
        ]).then(([overviewRes, courseRes]) => {
            setOverview(overviewRes.data);
            setCourseStats(courseRes.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>;

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

    return (
        <div className="space-y-8">
            <h1 className="section-title">รายงานและสถิติ</h1>

            {overview && (
                <>
                    {/* Overview Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="stat-card items-center text-center">
                            <HiOutlineUsers className="w-8 h-8 text-blue-400" />
                            <p className="text-2xl font-bold text-white">{overview.totalUsers}</p>
                            <p className="text-xs text-surface-400">ผู้ใช้ทั้งหมด</p>
                        </div>
                        <div className="stat-card items-center text-center">
                            <HiOutlineAcademicCap className="w-8 h-8 text-emerald-400" />
                            <p className="text-2xl font-bold text-white">{overview.totalCourses}</p>
                            <p className="text-xs text-surface-400">หลักสูตร</p>
                        </div>
                        <div className="stat-card items-center text-center">
                            <HiOutlineClipboardList className="w-8 h-8 text-amber-400" />
                            <p className="text-2xl font-bold text-white">{overview.totalRegistrations}</p>
                            <p className="text-xs text-surface-400">ลงทะเบียน</p>
                        </div>
                        <div className="stat-card items-center text-center">
                            <HiOutlineClipboardList className="w-8 h-8 text-yellow-400" />
                            <p className="text-2xl font-bold text-white">{overview.pendingRegistrations}</p>
                            <p className="text-xs text-surface-400">รออนุมัติ</p>
                        </div>
                        <div className="stat-card items-center text-center">
                            <HiOutlineStar className="w-8 h-8 text-yellow-400" />
                            <p className="text-2xl font-bold text-white">{overview.averageRating || '-'}</p>
                            <p className="text-xs text-surface-400">คะแนนเฉลี่ย</p>
                        </div>
                        <div className="stat-card items-center text-center">
                            <HiOutlineDocumentText className="w-8 h-8 text-violet-400" />
                            <p className="text-2xl font-bold text-white">{overview.totalCertificates}</p>
                            <p className="text-xs text-surface-400">ประกาศนียบัตร</p>
                        </div>
                    </div>

                    {/* User Breakdown */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">สัดส่วนผู้ใช้</h2>
                        <div className="flex gap-4 items-center">
                            <div className="flex-1">
                                <div className="w-full bg-surface-800 rounded-full h-4 overflow-hidden flex">
                                    <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(overview.totalStudents / overview.totalUsers * 100) || 0}%` }}></div>
                                    <div className="bg-amber-500 h-full transition-all" style={{ width: `${(overview.totalStaff / overview.totalUsers * 100) || 0}%` }}></div>
                                    <div className="bg-red-500 h-full transition-all" style={{ width: `${(overview.totalAdmins / overview.totalUsers * 100) || 0}%` }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-6 mt-3">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-sm text-surface-400">นักศึกษา ({overview.totalStudents})</span></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div><span className="text-sm text-surface-400">เจ้าหน้าที่ ({overview.totalStaff})</span></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-sm text-surface-400">แอดมิน ({overview.totalAdmins})</span></div>
                        </div>
                    </div>

                    {/* Registration Breakdown */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">สถานะการลงทะเบียน</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <p className="text-3xl font-bold text-emerald-400">{overview.approvedRegistrations}</p>
                                <p className="text-sm text-surface-400 mt-1">อนุมัติ</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <p className="text-3xl font-bold text-amber-400">{overview.pendingRegistrations}</p>
                                <p className="text-sm text-surface-400 mt-1">รออนุมัติ</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                <p className="text-3xl font-bold text-red-400">{overview.rejectedRegistrations}</p>
                                <p className="text-sm text-surface-400 mt-1">ปฏิเสธ</p>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Course Stats Table */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-white mb-4">สถิติรายหลักสูตร</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-surface-700">
                                <th className="text-left py-3 px-4 text-surface-400">หลักสูตร</th>
                                <th className="text-center py-3 px-4 text-surface-400">ลงทะเบียน</th>
                                <th className="text-center py-3 px-4 text-surface-400">อนุมัติ</th>
                                <th className="text-center py-3 px-4 text-surface-400 hidden md:table-cell">ประเมิน</th>
                                <th className="text-center py-3 px-4 text-surface-400 hidden md:table-cell">คะแนน</th>
                                <th className="text-center py-3 px-4 text-surface-400">ใบ cert</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courseStats.map(cs => (
                                <tr key={cs.id} className="border-b border-surface-800">
                                    <td className="py-3 px-4">
                                        <p className="text-white font-medium">{cs.title}</p>
                                        <p className="text-xs text-surface-500">{cs.category} · {formatDate(cs.startDate)}</p>
                                    </td>
                                    <td className="py-3 px-4 text-center text-surface-300">{cs.totalRegistrations}</td>
                                    <td className="py-3 px-4 text-center text-emerald-400">{cs.approved}</td>
                                    <td className="py-3 px-4 text-center text-surface-300 hidden md:table-cell">{cs.totalEvaluations}</td>
                                    <td className="py-3 px-4 text-center hidden md:table-cell">
                                        <span className={cs.averageRating >= 4 ? 'text-emerald-400' : cs.averageRating >= 3 ? 'text-amber-400' : 'text-red-400'}>
                                            {cs.averageRating || '-'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center text-violet-400">{cs.totalCertificates}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
