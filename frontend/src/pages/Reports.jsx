// นำเข้าไลบรารีที่จำเป็นสำหรับหน้ารายงานและสถิติ (สำหรับแอดมิน)
import { useState, useEffect } from 'react';
import api from '../services/api';
import ExcelJS from 'exceljs';
import { HiOutlineChartBar, HiOutlineUsers, HiOutlineAcademicCap, HiOutlineClipboardList, HiOutlineStar, HiOutlineDocumentText, HiOutlineDownload } from 'react-icons/hi';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// คอมโพเนนต์สรุปข้อมูลภาพรวม (Dashboard Reports) เช่น จำนวนผู้ใช้ทั้งหมด กราฟสถิติ
export default function Reports() {
    const [overview, setOverview] = useState(null);
    const [courseStats, setCourseStats] = useState([]);
    const [registrationStats, setRegistrationStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [monthRange, setMonthRange] = useState(6);

    // ดึงข้อมูลสถิติภาพรวม ข้อมูลหลักสูตร และประวัติการลงทะเบียนทั้งหมด
    useEffect(() => {
        Promise.all([
            api.get('/reports/overview'),
            api.get('/reports/courses'),
            api.get('/reports/registrations')
        ]).then(([overviewRes, courseRes, regRes]) => {
            setOverview(overviewRes.data);
            setCourseStats(courseRes.data);
            setRegistrationStats(regRes.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>;

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

    // ฟังก์ชันส่งออกสถิติภาพรวมออกมาเป็นไฟล์ Excel (.xlsx)
    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            
            // 1. Overview Sheet
            if (overview) {
                const overviewSheet = workbook.addWorksheet('ภาพรวม (Overview)');
                overviewSheet.columns = [
                    { header: 'ข้อมูล', key: 'label', width: 30 },
                    { header: 'จำนวน', key: 'value', width: 15 }
                ];
                overviewSheet.addRows([
                    { label: 'ผู้ใช้ทั้งหมด', value: overview.totalUsers },
                    { label: 'นักศึกษา', value: overview.totalStudents },
                    { label: 'เจ้าหน้าที่', value: overview.totalStaff },
                    { label: 'แอดมิน', value: overview.totalAdmins },
                    { label: 'หลักสูตร', value: overview.totalCourses },
                    { label: 'ลงทะเบียน', value: overview.totalRegistrations },
                    { label: 'อนุมัติ', value: overview.approvedRegistrations },
                    { label: 'รออนุมัติ', value: overview.pendingRegistrations },
                    { label: 'ปฏิเสธ', value: overview.rejectedRegistrations },
                    { label: 'ประกาศนียบัตร', value: overview.totalCertificates },
                    { label: 'คะแนนเฉลี่ย', value: overview.averageRating || 0 },
                ]);
                overviewSheet.getRow(1).font = { bold: true };
            }

            // 2. Course Stats Sheet
            if (courseStats && courseStats.length > 0) {
                const statsSheet = workbook.addWorksheet('สถิติรายหลักสูตร (Course Stats)');
                statsSheet.columns = [
                    { header: 'ชื่อหลักสูตร', key: 'title', width: 40 },
                    { header: 'หมวดหมู่', key: 'category', width: 25 },
                    { header: 'วันที่', key: 'startDate', width: 20 },
                    { header: 'ลงทะเบียนรวม', key: 'total', width: 15 },
                    { header: 'อนุมัติ', key: 'approved', width: 15 },
                    { header: 'ประเมิน', key: 'evaluations', width: 15 },
                    { header: 'คะแนนเฉลี่ย', key: 'rating', width: 15 },
                    { header: 'ใบ Certificate', key: 'certs', width: 15 },
                ];
                
                courseStats.forEach(cs => {
                    statsSheet.addRow({
                        title: cs.title,
                        category: cs.category,
                        startDate: formatDate(cs.startDate),
                        total: cs.totalRegistrations,
                        approved: cs.approved,
                        evaluations: cs.totalEvaluations,
                        rating: cs.averageRating || 0,
                        certs: cs.totalCertificates
                    });
                });
                statsSheet.getRow(1).font = { bold: true };
            }

            // Generate and download
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Reports_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export failed:", error);
            alert("เกิดข้อผิดพลาดในการโหลดไฟล์ Excel");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h1 className="section-title mb-0">รายงานและสถิติ</h1>
                <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 transition-all outline-none">
                    <HiOutlineDownload className="w-5 h-5 text-emerald-400" />
                    ดาวน์โหลด Excel
                </button>
            </div>

            {overview && (
                <>
                    {/* Overview Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="stat-card items-center text-center">
                            <HiOutlineUsers className="w-8 h-8 text-blue-500" />
                            <p className="text-2xl font-extrabold text-surface-900">{overview.totalUsers}</p>
                            <p className="text-xs font-semibold text-surface-700">ผู้ใช้ทั้งหมด</p>
                        </div>
                        <div className="stat-card items-center text-center">
                            <HiOutlineAcademicCap className="w-8 h-8 text-emerald-500" />
                            <p className="text-2xl font-extrabold text-surface-900">{overview.totalCourses}</p>
                            <p className="text-xs font-semibold text-surface-700">หลักสูตร</p>
                        </div>
                        <div className="stat-card items-center text-center">
                            <HiOutlineClipboardList className="w-8 h-8 text-amber-500" />
                            <p className="text-2xl font-extrabold text-surface-900">{overview.totalRegistrations}</p>
                            <p className="text-xs font-semibold text-surface-700">ลงทะเบียน</p>
                        </div>
                        <div className="stat-card items-center text-center">
                            <HiOutlineClipboardList className="w-8 h-8 text-yellow-500" />
                            <p className="text-2xl font-extrabold text-surface-900">{overview.pendingRegistrations}</p>
                            <p className="text-xs font-semibold text-surface-700">รออนุมัติ</p>
                        </div>
                        <div className="stat-card items-center text-center">
                            <HiOutlineStar className="w-8 h-8 text-yellow-500" />
                            <p className="text-2xl font-extrabold text-surface-900">{overview.averageRating || '-'}</p>
                            <p className="text-xs font-semibold text-surface-700">คะแนนเฉลี่ย</p>
                        </div>
                        <div className="stat-card items-center text-center">
                            <HiOutlineDocumentText className="w-8 h-8 text-violet-500" />
                            <p className="text-2xl font-extrabold text-surface-900">{overview.totalCertificates}</p>
                            <p className="text-xs font-semibold text-surface-700">ประกาศนียบัตร</p>
                        </div>
                    </div>

                    {/* Advanced Analytics Dashboard */}
                    {(() => {
                        const userPieData = [
                            { name: 'นักศึกษา', value: overview.totalStudents, color: '#10b981' },
                            { name: 'เจ้าหน้าที่', value: overview.totalStaff, color: '#f59e0b' },
                            { name: 'แอดมิน', value: overview.totalAdmins, color: '#ef4444' }
                        ].filter(d => d.value > 0);

                        const generateMonths = (range) => {
                            if (!registrationStats || Object.keys(registrationStats.byMonth).length === 0) return [];
                            
                            const result = [];
                            const d = new Date();
                            d.setDate(1);
                            
                            let count = range;
                            if (range === 'all') {
                                const months = Object.keys(registrationStats.byMonth).sort();
                                if (months.length > 0) {
                                    const oldest = new Date(months[0] + '-01');
                                    count = (d.getFullYear() - oldest.getFullYear()) * 12 + (d.getMonth() - oldest.getMonth()) + 1;
                                    if (count > 60) count = 60; // Cap at 5 years
                                } else {
                                    count = 6;
                                }
                            }
                            
                            for (let i = count - 1; i >= 0; i--) {
                                const past = new Date(d);
                                past.setMonth(d.getMonth() - i);
                                const year = past.getFullYear();
                                const month = String(past.getMonth() + 1).padStart(2, '0');
                                result.push(`${year}-${month}`);
                            }
                            return result;
                        };

                        const monthsToDisplay = generateMonths(monthRange);
                        const regLineData = monthsToDisplay.map(month => ({
                            name: month,
                            'ลงทะเบียนทั้งหมด': registrationStats?.byMonth[month]?.total || 0,
                            'อนุมัติแล้ว': registrationStats?.byMonth[month]?.approved || 0
                        }));

                        const topCoursesData = courseStats ? [...courseStats]
                            .sort((a, b) => b.totalRegistrations - a.totalRegistrations)
                            .slice(0, 5)
                            .map(c => ({
                                name: c.title.length > 20 ? c.title.substring(0, 20) + '...' : c.title,
                                'ยอดลงทะเบียน': c.totalRegistrations
                            })) : [];

                        const ratingData = courseStats ? [...courseStats]
                            .filter(c => c.totalEvaluations > 0)
                            .sort((a, b) => b.averageRating - a.averageRating)
                            .slice(0, 5)
                            .map(c => ({
                                name: c.title.length > 20 ? c.title.substring(0, 20) + '...' : c.title,
                                'คะแนนเฉลี่ย': c.averageRating
                            })) : [];

                        return (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                                {/* Registration Trend */}
                                <div className="glass-card p-6">
                                    <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                                        <h2 className="text-lg font-bold text-surface-800 flex items-center gap-2">
                                            <HiOutlineChartBar className="w-5 h-5 text-primary-500" />
                                            แนวโน้มการลงทะเบียนรายเดือน
                                        </h2>
                                        <select 
                                            value={monthRange} 
                                            onChange={(e) => setMonthRange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                            className="text-sm bg-surface-50 border border-surface-200 rounded-lg px-3 py-1.5 text-surface-700 font-medium focus:ring-2 focus:ring-primary-500 outline-none"
                                        >
                                            <option value={6}>6 เดือนล่าสุด</option>
                                            <option value={12}>12 เดือนล่าสุด</option>
                                            <option value="all">ทั้งหมด</option>
                                        </select>
                                    </div>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={regLineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                                                <Line type="monotone" dataKey="ลงทะเบียนทั้งหมด" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                                <Line type="monotone" dataKey="อนุมัติแล้ว" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* User Demographics */}
                                <div className="glass-card p-6">
                                    <h2 className="text-lg font-bold text-surface-800 mb-6 flex items-center gap-2">
                                        <HiOutlineUsers className="w-5 h-5 text-primary-500" />
                                        สัดส่วนกลุ่มผู้ใช้งาน
                                    </h2>
                                    <div className="h-[300px] w-full flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={userPieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={80}
                                                    outerRadius={110}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    labelLine={false}
                                                >
                                                    {userPieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Top Courses by Registrations */}
                                <div className="glass-card p-6">
                                    <h2 className="text-lg font-bold text-surface-800 mb-6 flex items-center gap-2">
                                        <HiOutlineAcademicCap className="w-5 h-5 text-primary-500" />
                                        หลักสูตรยอดนิยม 5 อันดับแรก
                                    </h2>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={topCoursesData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                                                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis dataKey="name" type="category" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} width={120} />
                                                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                <Bar dataKey="ยอดลงทะเบียน" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Top Courses by Ratings */}
                                <div className="glass-card p-6">
                                    <h2 className="text-lg font-bold text-surface-800 mb-6 flex items-center gap-2">
                                        <HiOutlineStar className="w-5 h-5 text-primary-500" />
                                        หลักสูตรที่มีคะแนนประเมินสูงสุด 5 อันดับ
                                    </h2>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={ratingData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                                                <XAxis type="number" domain={[0, 5]} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis dataKey="name" type="category" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} width={120} />
                                                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                <Bar dataKey="คะแนนเฉลี่ย" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={24} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Registration Breakdown */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-bold text-surface-800 mb-4">สถานะการลงทะเบียน</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                                <p className="text-3xl font-extrabold text-emerald-600">{overview.approvedRegistrations}</p>
                                <p className="text-sm font-semibold text-surface-700 mt-1">อนุมัติ</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-amber-50 border border-amber-200">
                                <p className="text-3xl font-extrabold text-amber-500">{overview.pendingRegistrations}</p>
                                <p className="text-sm font-semibold text-surface-700 mt-1">รออนุมัติ</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-red-50 border border-red-200">
                                <p className="text-3xl font-extrabold text-red-500">{overview.rejectedRegistrations}</p>
                                <p className="text-sm font-semibold text-surface-700 mt-1">ปฏิเสธ</p>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Course Stats Table */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-bold text-surface-800 mb-4">สถิติรายหลักสูตร</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-surface-300">
                                <th className="text-left py-3 px-4 text-surface-700 font-bold">หลักสูตร</th>
                                <th className="text-center py-3 px-4 text-surface-700 font-bold">ลงทะเบียน</th>
                                <th className="text-center py-3 px-4 text-surface-700 font-bold">อนุมัติ</th>
                                <th className="text-center py-3 px-4 text-surface-700 font-bold hidden md:table-cell">ประเมิน</th>
                                <th className="text-center py-3 px-4 text-surface-700 font-bold hidden md:table-cell">คะแนน</th>
                                <th className="text-center py-3 px-4 text-surface-700 font-bold">ใบ cert</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courseStats.map(cs => (
                                <tr key={cs.id} className="border-b border-surface-200 hover:bg-surface-50 transition-colors">
                                    <td className="py-3 px-4">
                                        <p className="text-surface-900 font-semibold">{cs.title}</p>
                                        <p className="text-xs font-medium text-surface-600">{cs.category} · {formatDate(cs.startDate)}</p>
                                    </td>
                                    <td className="py-3 px-4 text-center text-surface-700 font-medium">{cs.totalRegistrations}</td>
                                    <td className="py-3 px-4 text-center text-emerald-600 font-semibold">{cs.approved}</td>
                                    <td className="py-3 px-4 text-center text-surface-700 font-medium hidden md:table-cell">{cs.totalEvaluations}</td>
                                    <td className="py-3 px-4 text-center hidden md:table-cell font-semibold">
                                        <span className={cs.averageRating >= 4 ? 'text-emerald-600' : cs.averageRating >= 3 ? 'text-amber-500' : 'text-red-500'}>
                                            {cs.averageRating || '-'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center text-violet-600 font-semibold">{cs.totalCertificates}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
