// นำเข้าไลบรารีที่จำเป็นสำหรับหน้าดูผลการประเมิน (แอดมิน)
import { useState, useEffect } from 'react';
import api from '../services/api';
import ExcelJS from 'exceljs';
import toast from 'react-hot-toast';
import { HiOutlineStar, HiStar, HiOutlineChartBar, HiOutlineUserGroup, HiOutlineTrendingUp, HiOutlineDownload } from 'react-icons/hi';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';

// คอมโพเนนต์กราฟแท่งแนวนอน (BarChart) ทำขึ้นมาใช้งานเองแบบง่ายๆ
const BarChart = ({ data, maxValue = 5, label }) => (
    <div style={{ marginBottom: 20 }}>
        {label && <h3 className="text-sm font-bold text-surface-700 mb-4">{label}</h3>}
        {data.map((item, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                <span className="text-sm font-medium text-surface-700 w-40 truncate" title={item.label}>
                    {item.label}
                </span>
                <div className="flex-1 h-8 rounded-xl bg-surface-100 border border-surface-200 overflow-hidden">
                    <div
                        className="h-full rounded-xl transition-all duration-700 ease-out flex items-center justify-end px-3"
                        style={{
                            width: `${(item.value / maxValue) * 100}%`,
                            background: item.color || 'linear-gradient(90deg, #3b82f6, #2563eb)',
                            minWidth: item.value > 0 ? '45px' : '0',
                        }}
                    >
                        {item.value > 0 && (
                            <span className="text-xs font-extrabold text-white drop-shadow-sm">
                                {item.value}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        ))}
    </div>
);

// คอมโพเนนต์กราฟพื้นที่ (AreaChart) สรุปคะแนนตามหมวดหมู่
const CategoryLineChart = ({ data, label }) => {
    const chartData = data.map(item => ({
        subject: item.label,
        score: item.value,
        fullMark: 5,
    }));

    return (
        <div style={{ marginBottom: 20 }}>
            {label && <h3 className="text-sm font-bold text-surface-700 mb-4">{label}</h3>}
            <div className="w-full h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorCategory" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="subject" 
                            tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} 
                            axisLine={false} 
                            tickLine={false}
                        />
                        <YAxis 
                            domain={[0, 5]} 
                            tick={{ fill: '#94a3b8', fontSize: 10 }} 
                            axisLine={false} 
                            tickLine={false}
                        />
                        <RechartsTooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                            itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                            formatter={(value) => [`${value} คะแนน`, 'ผลประเมิน']}
                        />
                        <Area
                            type="monotone"
                            dataKey="score"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorCategory)"
                            activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// Line Chart for Score Trend over time
const ScoreTrendChart = ({ data }) => {
    return (
        <div className="w-full h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#64748b', fontSize: 11 }} 
                        axisLine={false} 
                        tickLine={false}
                    />
                    <YAxis 
                        domain={[0, 5]} 
                        tick={{ fill: '#64748b', fontSize: 11 }} 
                        axisLine={false} 
                        tickLine={false}
                    />
                    <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                        itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                        formatter={(value) => [`${value} คะแนน`, 'คะแนนเฉลี่ย']}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line 
                        name="คะแนนเฉลี่ยรายเดือน"
                        type="monotone" 
                        dataKey="avgRating" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#3b82f6' }}
                        activeDot={{ r: 6, strokeWidth: 2, fill: '#fff', stroke: '#3b82f6' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

// Circular gauge for overall rating
const RatingGauge = ({ rating, maxRating = 5, totalResponses }) => {
    const percentage = (rating / maxRating) * 100;
    const circumference = 2 * Math.PI * 54;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    const color = rating >= 4 ? '#27ae60' : rating >= 3 ? '#f39c12' : '#e74c3c';

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: 140, height: 140 }}>
                <svg width="140" height="140" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                    <circle cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="10"
                        strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                        transform="rotate(-90 60 60)"
                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-surface-900">{rating}</span>
                    <span className="text-xs font-medium text-surface-700">/ {maxRating}</span>
                </div>
            </div>
            <p className="text-sm font-bold text-surface-700 mt-2">คะแนนเฉลี่ยรวม</p>
            <p className="text-xs font-medium text-surface-600">จาก {totalResponses} คน</p>
        </div>
    );
};

// Rating distribution Pie chart
const RatingDistribution = ({ evaluations }) => {
    const data = [5, 4, 3, 2, 1].map(star => ({
        name: `${star} ดาว`,
        value: evaluations.filter(e => Math.round(e.rating) === star).length,
    })).filter(d => d.value > 0); // Only show segments with > 0 votes

    // Colors for 5, 4, 3, 2, 1 stars
    const COLORS = ['#10b981', '#34d399', '#f59e0b', '#f87171', '#ef4444'];
    
    // Map colors based on the star rating name
    const getColor = (name) => {
        if (name.includes('5')) return COLORS[0];
        if (name.includes('4')) return COLORS[1];
        if (name.includes('3')) return COLORS[2];
        if (name.includes('2')) return COLORS[3];
        return COLORS[4];
    };

    return (
        <div>
            <h3 className="text-sm font-bold text-surface-700 mb-4">การกระจายคะแนน</h3>
            {data.length === 0 ? (
                <p className="text-surface-500 text-sm text-center py-8">ไม่มีข้อมูล</p>
            ) : (
                <div className="w-full h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
                                ))}
                            </Pie>
                            <RechartsTooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                                formatter={(value) => [`${value} คน`, 'จำนวน']}
                            />
                            <Legend 
                                verticalAlign="bottom" 
                                height={36} 
                                iconType="circle"
                                formatter={(value) => <span className="text-sm font-medium text-surface-700">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

// Star display row
const StarDisplay = ({ rating, label }) => (
    <div className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-surface-200">
        <span className="text-sm font-semibold text-surface-700">{label}</span>
        <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(n => (
                    <HiOutlineStar key={n} className={`w-4 h-4 ${n <= Math.round(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-surface-300'}`} />
                ))}
            </div>
            <span className="text-sm font-bold text-surface-900 min-w-[2rem] text-right">{rating}</span>
        </div>
    </div>
);

export default function EvaluationResults() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [results, setResults] = useState(null); // Filtered results for selected course
    const [allResults, setAllResults] = useState(null); // Filtered results for all courses
    const [rawEvaluations, setRawEvaluations] = useState([]); // All raw evaluations from API
    
    // Date Filtering States
    const [dateFilter, setDateFilter] = useState('all'); // 'all', '3months', '6months', 'custom'
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/courses').then(res => {
            setCourses(res.data);
            setLoading(false);
            // Fetch all evaluations for summary graph
            if (res.data.length > 0) {
                fetchAllResults(res.data);
            }
        });
    }, []);

    const fetchAllResults = async (courseList) => {
        const allEvals = [];
        for (const course of courseList) {
            try {
                const res = await api.get(`/evaluations/course/${course.id}`);
                if (res.data.evaluations.length > 0) {
                    allEvals.push(...res.data.evaluations.map(ev => ({ ...ev, courseName: course.title, courseId: course.id })));
                }
            } catch { }
        }
        setRawEvaluations(allEvals);
    };

    // Helper to compute summary from an array of evaluations
    const computeSummary = (evalsArray, isAllCourses = false) => {
        if (evalsArray.length === 0) return null;

        const totalResponses = evalsArray.length;
        const sumRating = evalsArray.reduce((acc, ev) => acc + ev.rating, 0);
        const sumContent = evalsArray.reduce((acc, ev) => acc + (ev.contentRating || ev.rating), 0);
        const sumInstructor = evalsArray.reduce((acc, ev) => acc + (ev.instructorRating || ev.rating), 0);
        const sumFacility = evalsArray.reduce((acc, ev) => acc + (ev.facilityRating || ev.rating), 0);

        const summary = {
            evaluations: evalsArray,
            totalResponses,
            averageRating: Number((sumRating / totalResponses).toFixed(2)),
            avgContentRating: Number((sumContent / totalResponses).toFixed(2)),
            avgInstructorRating: Number((sumInstructor / totalResponses).toFixed(2)),
            avgFacilityRating: Number((sumFacility / totalResponses).toFixed(2)),
        };

        if (isAllCourses) {
            // Group by Date for trend analysis
            const dateMap = {};
            evalsArray.forEach(ev => {
                const dateStr = new Date(ev.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
                if (!dateMap[dateStr]) {
                    dateMap[dateStr] = { date: dateStr, total: 0, count: 0, sortKey: new Date(ev.createdAt).getTime() };
                }
                dateMap[dateStr].total += ev.rating;
                dateMap[dateStr].count += 1;
            });
            const trendData = Object.values(dateMap)
                .sort((a, b) => a.sortKey - b.sortKey)
                .map(d => ({
                    date: d.date,
                    avgRating: Number((d.total / d.count).toFixed(2)),
                    responses: d.count
                }));

            // Group by course
            const courseMap = {};
            evalsArray.forEach(ev => {
                if (!courseMap[ev.courseId]) {
                    courseMap[ev.courseId] = { name: ev.courseName, total: 0, count: 0 };
                }
                courseMap[ev.courseId].total += ev.rating;
                courseMap[ev.courseId].count += 1;
            });
            const perCourse = Object.values(courseMap).map(c => ({
                name: c.name,
                avgRating: Number((c.total / c.count).toFixed(2)),
                responses: c.count
            }));

            return {
                evaluations: evalsArray,
                totalResponses,
                avgRating: summary.averageRating,
                avgContent: summary.avgContentRating,
                avgInstructor: summary.avgInstructorRating,
                avgFacility: summary.avgFacilityRating,
                perCourse,
                trendData
            };
        }
        return { summary, evaluations: evalsArray, trendData };
    };

    // Recompute filtered data whenever dateFilter, custom dates, or rawEvaluations change
    useEffect(() => {
        if (rawEvaluations.length === 0) {
            setAllResults(null);
            setResults(null);
            return;
        }

        let filteredEvals = rawEvaluations;
        const now = new Date();

        if (dateFilter === '3months') {
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(now.getMonth() - 3);
            filteredEvals = rawEvaluations.filter(ev => new Date(ev.createdAt) >= threeMonthsAgo);
        } else if (dateFilter === '6months') {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(now.getMonth() - 6);
            filteredEvals = rawEvaluations.filter(ev => new Date(ev.createdAt) >= sixMonthsAgo);
        } else if (dateFilter === 'custom' && customStartDate && customEndDate) {
            const start = new Date(customStartDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999);
            filteredEvals = rawEvaluations.filter(ev => {
                const date = new Date(ev.createdAt);
                return date >= start && date <= end;
            });
        }

        // 1. Compute for ALL courses
        setAllResults(computeSummary(filteredEvals, true));

        // 2. Compute for SELECTED course
        if (selectedCourse) {
            const courseEvals = filteredEvals.filter(ev => String(ev.courseId) === String(selectedCourse));
            setResults(computeSummary(courseEvals, false));
        } else {
            setResults(null);
        }
    }, [rawEvaluations, dateFilter, customStartDate, customEndDate, selectedCourse]);

    const exportToExcel = async () => {
        try {
            if (!allResults || allResults.evaluations.length === 0) {
                toast.error('ไม่มีข้อมูลผลประเมินสำหรับดาวน์โหลด');
                return;
            }

            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'ARIT Training Management';
            workbook.created = new Date();

            // Sheet 1: รายละเอียดผลประเมิน
            const ws1 = workbook.addWorksheet('ผลประเมินรายบุคคล');
            ws1.columns = [
                { header: 'ลำดับ', key: 'no', width: 8 },
                { header: 'หลักสูตร', key: 'courseName', width: 35 },
                { header: 'ผู้ประเมิน', key: 'userName', width: 22 },
                { header: 'คะแนนรวม', key: 'rating', width: 12 },
                { header: 'เนื้อหา', key: 'contentRating', width: 10 },
                { header: 'วิทยากร', key: 'instructorRating', width: 10 },
                { header: 'สถานที่', key: 'facilityRating', width: 10 },
                { header: 'ข้อเสนอแนะ', key: 'comment', width: 40 },
            ];

            const headerRow1 = ws1.getRow(1);
            headerRow1.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
            headerRow1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
            headerRow1.alignment = { vertical: 'middle', horizontal: 'center' };
            headerRow1.height = 30;

            // Sort evaluations by courseName then userName
            const sortedEvaluations = [...allResults.evaluations].sort((a, b) => {
                const courseA = a.courseName || '';
                const courseB = b.courseName || '';
                const courseCompare = courseA.localeCompare(courseB, 'th');
                if (courseCompare !== 0) return courseCompare;
                const userA = a.userName || '';
                const userB = b.userName || '';
                return userA.localeCompare(userB, 'th');
            });

            sortedEvaluations.forEach((ev, index) => {
                const row = ws1.addRow({
                    no: index + 1,
                    courseName: ev.courseName || '',
                    userName: ev.userName || '',
                    rating: ev.rating,
                    contentRating: ev.contentRating,
                    instructorRating: ev.instructorRating,
                    facilityRating: ev.facilityRating,
                    comment: ev.comment || '-',
                });
                row.alignment = { vertical: 'middle', wrapText: true };
            });

            // Sheet 2: สรุปรายหลักสูตร
            const ws2 = workbook.addWorksheet('สรุปรายหลักสูตร');
            ws2.columns = [
                { header: 'ลำดับ', key: 'no', width: 8 },
                { header: 'หลักสูตร', key: 'name', width: 35 },
                { header: 'คะแนนเฉลี่ย', key: 'avgRating', width: 14 },
                { header: 'จำนวนผู้ประเมิน', key: 'responses', width: 16 },
            ];

            const headerRow2 = ws2.getRow(1);
            headerRow2.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
            headerRow2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } };
            headerRow2.alignment = { vertical: 'middle', horizontal: 'center' };
            headerRow2.height = 30;

            // Sort perCourse by course name
            const sortedPerCourse = [...allResults.perCourse].sort((a, b) => {
                const nameA = a.name || '';
                const nameB = b.name || '';
                return nameA.localeCompare(nameB, 'th');
            });

            sortedPerCourse.forEach((c, index) => {
                ws2.addRow({ no: index + 1, name: c.name, avgRating: c.avgRating, responses: c.responses });
            });

            // Add borders to all sheets
            [ws1, ws2].forEach(ws => {
                ws.eachRow(row => {
                    row.eachCell(cell => {
                        cell.border = {
                            top: { style: 'thin' }, left: { style: 'thin' },
                            bottom: { style: 'thin' }, right: { style: 'thin' },
                        };
                    });
                });
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ผลการประเมิน_${new Date().toISOString().slice(0, 10)}.xlsx`;
            link.click();
            URL.revokeObjectURL(url);

            toast.success('ดาวน์โหลดไฟล์ Excel สำเร็จ');
        } catch (err) {
            console.error(err);
            toast.error('เกิดข้อผิดพลาดในการสร้างไฟล์ Excel');
        }
    };

    const exportCourseToExcel = async () => {
        try {
            if (!results || results.evaluations.length === 0) {
                toast.error('ไม่มีข้อมูลผลประเมินสำหรับหลักสูตรนี้');
                return;
            }

            const course = courses.find(c => String(c.id) === String(selectedCourse));
            const courseName = course ? course.title : 'หลักสูตร';

            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'ARIT Training Management';
            workbook.created = new Date();

            const ws = workbook.addWorksheet('ผลประเมิน');
            ws.columns = [
                { header: 'ลำดับ', key: 'no', width: 8 },
                { header: 'ผู้ประเมิน', key: 'userName', width: 22 },
                { header: 'คะแนนรวม', key: 'rating', width: 12 },
                { header: 'เนื้อหา', key: 'contentRating', width: 10 },
                { header: 'วิทยากร', key: 'instructorRating', width: 10 },
                { header: 'สถานที่', key: 'facilityRating', width: 10 },
                { header: 'ข้อเสนอแนะ', key: 'comment', width: 40 },
            ];

            const headerRow = ws.getRow(1);
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
            headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
            headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
            headerRow.height = 30;

            // Sort evaluations by userName
            const sortedCourseEvaluations = [...results.evaluations].sort((a, b) => {
                const userA = a.userName || '';
                const userB = b.userName || '';
                return userA.localeCompare(userB, 'th');
            });

            sortedCourseEvaluations.forEach((ev, index) => {
                const row = ws.addRow({
                    no: index + 1,
                    userName: ev.userName || '',
                    rating: ev.rating,
                    contentRating: ev.contentRating,
                    instructorRating: ev.instructorRating,
                    facilityRating: ev.facilityRating,
                    comment: ev.comment || '-',
                });
                row.alignment = { vertical: 'middle', wrapText: true };
            });

            ws.eachRow(row => {
                row.eachCell(cell => {
                    cell.border = {
                        top: { style: 'thin' }, left: { style: 'thin' },
                        bottom: { style: 'thin' }, right: { style: 'thin' },
                    };
                });
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ผลการประเมิน_${courseName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
            link.click();
            URL.revokeObjectURL(url);

            toast.success('ดาวน์โหลดไฟล์ Excel สำเร็จ');
        } catch (err) {
            console.error(err);
            toast.error('เกิดข้อผิดพลาดในการสร้างไฟล์ Excel');
        }
    };

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="section-title">ผลการประเมินการอบรม</h1>
                {allResults && allResults.evaluations.length > 0 && (
                    <button
                        onClick={exportToExcel}
                        className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
                    >
                        <HiOutlineDownload className="w-4 h-4" />
                        ดาวน์โหลด Excel
                    </button>
                )}
            </div>

            {/* ========== DATE FILTER ========== */}
            <div className="glass-card p-4 flex flex-col md:flex-row items-center gap-4 justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-surface-700">ช่วงเวลา:</span>
                    <select 
                        className="input-field py-1.5 px-3 text-sm min-w-[150px]"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    >
                        <option value="all">ทั้งหมด</option>
                        <option value="3months">3 เดือนย้อนหลัง</option>
                        <option value="6months">6 เดือนย้อนหลัง</option>
                        <option value="custom">กำหนดเอง</option>
                    </select>
                </div>

                {dateFilter === 'custom' && (
                    <div className="flex items-center gap-2">
                        <input 
                            type="date" 
                            className="input-field py-1.5 px-3 text-sm"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                        />
                        <span className="text-surface-500">-</span>
                        <input 
                            type="date" 
                            className="input-field py-1.5 px-3 text-sm"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                        />
                    </div>
                )}
            </div>

            {/* ========== ALL COURSES SUMMARY ========== */}
            {allResults ? (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-surface-800 flex items-center gap-2">
                        <HiOutlineChartBar className="w-5 h-5 text-primary-600" />
                        สรุปผลการประเมินทุกหลักสูตร
                    </h2>

                    {/* Stats cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="glass-card p-4 text-center">
                            <HiOutlineUserGroup className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                            <p className="text-2xl font-extrabold text-surface-900">{allResults.totalResponses}</p>
                            <p className="text-xs font-medium text-surface-700">ผู้ประเมินทั้งหมด</p>
                        </div>
                        <div className="glass-card p-4 text-center">
                            <HiOutlineStar className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                            <p className="text-2xl font-extrabold text-yellow-600">{allResults.avgRating}</p>
                            <p className="text-xs font-medium text-surface-700">คะแนนเฉลี่ยรวม</p>
                        </div>
                        <div className="glass-card p-4 text-center">
                            <HiOutlineTrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                            <p className="text-2xl font-extrabold text-surface-900">{allResults.perCourse.length}</p>
                            <p className="text-xs font-medium text-surface-700">หลักสูตรที่มีผลประเมิน</p>
                        </div>
                        <div className="glass-card p-4 text-center">
                            <HiOutlineChartBar className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                            <p className="text-2xl font-extrabold text-surface-900">
                                {allResults.totalResponses > 0 ? Math.round(allResults.totalResponses / allResults.perCourse.length) : 0}
                            </p>
                            <p className="text-xs font-medium text-surface-700">เฉลี่ยต่อหลักสูตร</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Category ratings bar chart */}
                        <div className="glass-card p-6">
                            <CategoryLineChart label="คะแนนเฉลี่ยตามหมวด" data={[
                                { label: 'ภาพรวม', value: allResults.avgRating },
                                { label: 'เนื้อหา', value: allResults.avgContent },
                                { label: 'วิทยากร', value: allResults.avgInstructor },
                                { label: 'สถานที่', value: allResults.avgFacility },
                            ]} />
                        </div>

                        {/* Rating distribution */}
                        <div className="glass-card p-6">
                            <RatingDistribution evaluations={allResults.evaluations} />
                        </div>
                    </div>

                    {/* Trend over time */}
                    {allResults.trendData && allResults.trendData.length > 0 && (
                        <div className="glass-card p-6 mt-4">
                            <h3 className="text-sm font-bold text-surface-700 mb-4">แนวโน้มคะแนนเฉลี่ย (ตามวัน/เดือน/ปี)</h3>
                            <ScoreTrendChart data={allResults.trendData} />
                        </div>
                    )}
                </div>
            ) : (
                <div className="glass-card p-8 text-center">
                    <p className="text-surface-500 font-medium">ไม่พบข้อมูลผลการประเมินในช่วงเวลาที่เลือก</p>
                </div>
            )}

            {/* ========== COURSE SELECTOR ========== */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-bold text-surface-800 mb-3">ดูผลประเมินรายหลักสูตร</h2>
                <label className="block text-sm font-semibold text-surface-700 mb-2">เลือกหลักสูตร</label>
                <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="input-field max-w-md">
                    <option value="">-- เลือกหลักสูตร --</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
            </div>

            {/* ========== SELECTED COURSE RESULTS ========== */}
            {results && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Summary with gauge */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white">สรุปผลการประเมิน</h2>
                            {results.evaluations.length > 0 && (
                                <button
                                    onClick={exportCourseToExcel}
                                    className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
                                >
                                    <HiOutlineDownload className="w-4 h-4" />
                                    โหลด Excel
                                </button>
                            )}
                        </div>
                        <div className="flex justify-center mb-6">
                            <RatingGauge
                                rating={results.summary.averageRating}
                                totalResponses={results.summary.totalResponses}
                            />
                        </div>
                        <div className="space-y-2">
                            <StarDisplay rating={results.summary.avgContentRating} label="เนื้อหาการอบรม" />
                            <StarDisplay rating={results.summary.avgInstructorRating} label="วิทยากร/ผู้สอน" />
                            <StarDisplay rating={results.summary.avgFacilityRating} label="สถานที่/สิ่งอำนวยความสะดวก" />
                        </div>

                        {/* Mini bar chart for this course */}
                        <div className="mt-6 pt-4 border-t border-surface-700/50">
                            <CategoryLineChart label="กราฟคะแนนรายหมวด" data={[
                                { label: 'ภาพรวม', value: results.summary.averageRating },
                                { label: 'เนื้อหา', value: results.summary.avgContentRating },
                                { label: 'วิทยากร', value: results.summary.avgInstructorRating },
                                { label: 'สถานที่', value: results.summary.avgFacilityRating },
                            ]} />
                            <RatingDistribution evaluations={results.evaluations} />
                        </div>
                    </div>

                    {/* Comments */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">ข้อเสนอแนะ</h2>
                        {results.evaluations.length === 0 ? (
                            <p className="text-surface-500 text-center py-8">ยังไม่มีผลประเมิน</p>
                        ) : (
                            <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                {results.evaluations.map(ev => (
                                    <div key={ev.id} className="p-4 rounded-xl bg-surface-800/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-surface-400 font-medium">{ev.userName}</span>
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map(n => (
                                                    n <= ev.rating
                                                        ? <HiStar key={n} className="w-3.5 h-3.5 text-yellow-500" />
                                                        : <HiOutlineStar key={n} className="w-3.5 h-3.5 text-surface-600" />
                                                ))}
                                            </div>
                                        </div>
                                        {ev.comment && <p className="text-sm text-surface-300 leading-relaxed">{ev.comment}</p>}
                                        {!ev.comment && <p className="text-xs text-surface-500 italic">ไม่มีข้อเสนอแนะ</p>}
                                        <div className="flex gap-4 mt-2 text-xs text-surface-500">
                                            <span>เนื้อหา: {ev.contentRating}/5</span>
                                            <span>วิทยากร: {ev.instructorRating}/5</span>
                                            <span>สถานที่: {ev.facilityRating}/5</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
