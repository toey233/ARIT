import { useState, useEffect } from 'react';
import api from '../services/api';
import ExcelJS from 'exceljs';
import toast from 'react-hot-toast';
import { HiOutlineStar, HiStar, HiOutlineChartBar, HiOutlineUserGroup, HiOutlineTrendingUp, HiOutlineDownload } from 'react-icons/hi';

// CSS bar chart component
const BarChart = ({ data, maxValue = 5, label }) => (
    <div style={{ marginBottom: 20 }}>
        {label && <h3 className="text-sm font-semibold text-surface-300 mb-3">{label}</h3>}
        {data.map((item, i) => (
            <div key={i} className="flex items-center gap-3 mb-2">
                <span className="text-xs text-surface-400 w-32 truncate">{item.label}</span>
                <div className="flex-1 h-7 rounded-lg bg-surface-800/60 overflow-hidden relative">
                    <div
                        className="h-full rounded-lg transition-all duration-700 ease-out"
                        style={{
                            width: `${(item.value / maxValue) * 100}%`,
                            background: item.color || 'linear-gradient(90deg, #C49B28, #8B6914)',
                            minWidth: item.value > 0 ? '20px' : '0',
                        }}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-white/80">
                        {item.value}
                    </span>
                </div>
            </div>
        ))}
    </div>
);

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
                    <span className="text-3xl font-bold text-white">{rating}</span>
                    <span className="text-xs text-surface-400">/ {maxRating}</span>
                </div>
            </div>
            <p className="text-sm text-surface-400 mt-2">คะแนนเฉลี่ยรวม</p>
            <p className="text-xs text-surface-500">จาก {totalResponses} คน</p>
        </div>
    );
};

// Rating distribution bar (e.g., 5★ = 10 responses)
const RatingDistribution = ({ evaluations }) => {
    const dist = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: evaluations.filter(e => Math.round(e.rating) === star).length,
    }));
    const maxCount = Math.max(...dist.map(d => d.count), 1);

    return (
        <div>
            <h3 className="text-sm font-semibold text-surface-300 mb-3">การกระจายคะแนน</h3>
            {dist.map(d => (
                <div key={d.star} className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-yellow-500 w-8 flex items-center gap-0.5">
                        {d.star} <HiStar className="w-3 h-3" />
                    </span>
                    <div className="flex-1 h-5 rounded bg-surface-800/60 overflow-hidden">
                        <div className="h-full rounded transition-all duration-700 ease-out"
                            style={{
                                width: `${(d.count / maxCount) * 100}%`,
                                background: d.star >= 4 ? '#27ae60' : d.star >= 3 ? '#f39c12' : '#e74c3c',
                                minWidth: d.count > 0 ? '8px' : '0',
                            }} />
                    </div>
                    <span className="text-xs text-surface-400 w-10 text-right">{d.count} คน</span>
                </div>
            ))}
        </div>
    );
};

// Star display row
const StarDisplay = ({ rating, label }) => (
    <div className="flex items-center justify-between p-3 rounded-xl bg-surface-800/50">
        <span className="text-sm text-surface-300">{label}</span>
        <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(n => (
                    <HiOutlineStar key={n} className={`w-4 h-4 ${n <= Math.round(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-surface-600'}`} />
                ))}
            </div>
            <span className="text-sm font-medium text-white min-w-[2rem] text-right">{rating}</span>
        </div>
    </div>
);

export default function EvaluationResults() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [results, setResults] = useState(null);
    const [allResults, setAllResults] = useState(null);
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
        let totalRating = 0, totalContent = 0, totalInstructor = 0, totalFacility = 0, totalCount = 0;
        const perCourse = [];

        for (const course of courseList) {
            try {
                const res = await api.get(`/evaluations/course/${course.id}`);
                if (res.data.evaluations.length > 0) {
                    allEvals.push(...res.data.evaluations.map(ev => ({ ...ev, courseName: course.title })));
                    totalRating += res.data.summary.averageRating * res.data.summary.totalResponses;
                    totalContent += res.data.summary.avgContentRating * res.data.summary.totalResponses;
                    totalInstructor += res.data.summary.avgInstructorRating * res.data.summary.totalResponses;
                    totalFacility += res.data.summary.avgFacilityRating * res.data.summary.totalResponses;
                    totalCount += res.data.summary.totalResponses;
                    perCourse.push({
                        name: course.title,
                        avgRating: res.data.summary.averageRating,
                        responses: res.data.summary.totalResponses,
                    });
                }
            } catch { }
        }

        if (totalCount > 0) {
            setAllResults({
                evaluations: allEvals,
                totalResponses: totalCount,
                avgRating: Number((totalRating / totalCount).toFixed(2)),
                avgContent: Number((totalContent / totalCount).toFixed(2)),
                avgInstructor: Number((totalInstructor / totalCount).toFixed(2)),
                avgFacility: Number((totalFacility / totalCount).toFixed(2)),
                perCourse,
            });
        }
    };

    useEffect(() => {
        if (selectedCourse) {
            api.get(`/evaluations/course/${selectedCourse}`).then(res => setResults(res.data));
        } else {
            setResults(null);
        }
    }, [selectedCourse]);

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

            allResults.evaluations.forEach((ev, index) => {
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

            allResults.perCourse.forEach((c, index) => {
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

            {/* ========== ALL COURSES SUMMARY ========== */}
            {allResults && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <HiOutlineChartBar className="w-5 h-5 text-primary-400" />
                        สรุปผลการประเมินทุกหลักสูตร
                    </h2>

                    {/* Stats cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="glass-card p-4 text-center">
                            <HiOutlineUserGroup className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-white">{allResults.totalResponses}</p>
                            <p className="text-xs text-surface-400">ผู้ประเมินทั้งหมด</p>
                        </div>
                        <div className="glass-card p-4 text-center">
                            <HiOutlineStar className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-yellow-500">{allResults.avgRating}</p>
                            <p className="text-xs text-surface-400">คะแนนเฉลี่ยรวม</p>
                        </div>
                        <div className="glass-card p-4 text-center">
                            <HiOutlineTrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-white">{allResults.perCourse.length}</p>
                            <p className="text-xs text-surface-400">หลักสูตรที่มีผลประเมิน</p>
                        </div>
                        <div className="glass-card p-4 text-center">
                            <HiOutlineChartBar className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-white">
                                {allResults.totalResponses > 0 ? Math.round(allResults.totalResponses / allResults.perCourse.length) : 0}
                            </p>
                            <p className="text-xs text-surface-400">เฉลี่ยต่อหลักสูตร</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Category ratings bar chart */}
                        <div className="glass-card p-6">
                            <h3 className="text-sm font-semibold text-surface-300 mb-4">คะแนนเฉลี่ยตามหมวด</h3>
                            <BarChart data={[
                                { label: 'ความพึงพอใจรวม', value: allResults.avgRating, color: 'linear-gradient(90deg, #f39c12, #e67e22)' },
                                { label: 'เนื้อหาการอบรม', value: allResults.avgContent, color: 'linear-gradient(90deg, #3498db, #2980b9)' },
                                { label: 'วิทยากร/ผู้สอน', value: allResults.avgInstructor, color: 'linear-gradient(90deg, #2ecc71, #27ae60)' },
                                { label: 'สถานที่/อำนวยฯ', value: allResults.avgFacility, color: 'linear-gradient(90deg, #9b59b6, #8e44ad)' },
                            ]} />
                        </div>

                        {/* Rating distribution */}
                        <div className="glass-card p-6">
                            <RatingDistribution evaluations={allResults.evaluations} />
                        </div>
                    </div>

                    {/* Per-course comparison */}
                    {allResults.perCourse.length > 1 && (
                        <div className="glass-card p-6">
                            <h3 className="text-sm font-semibold text-surface-300 mb-4">เปรียบเทียบคะแนนรายหลักสูตร</h3>
                            <BarChart data={allResults.perCourse.map(c => ({
                                label: c.name.length > 25 ? c.name.substring(0, 25) + '...' : c.name,
                                value: c.avgRating,
                                color: c.avgRating >= 4 ? 'linear-gradient(90deg, #27ae60, #2ecc71)' :
                                    c.avgRating >= 3 ? 'linear-gradient(90deg, #f39c12, #e67e22)' :
                                        'linear-gradient(90deg, #e74c3c, #c0392b)',
                            }))} />
                        </div>
                    )}
                </div>
            )}

            {/* ========== COURSE SELECTOR ========== */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-white mb-3">ดูผลประเมินรายหลักสูตร</h2>
                <label className="block text-sm text-surface-300 mb-2">เลือกหลักสูตร</label>
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
                        <h2 className="text-lg font-semibold text-white mb-4">สรุปผลการประเมิน</h2>
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
                            <BarChart label="กราฟคะแนนรายหมวด" data={[
                                { label: 'ความพึงพอใจรวม', value: results.summary.averageRating, color: 'linear-gradient(90deg, #f39c12, #e67e22)' },
                                { label: 'เนื้อหา', value: results.summary.avgContentRating, color: 'linear-gradient(90deg, #3498db, #2980b9)' },
                                { label: 'วิทยากร', value: results.summary.avgInstructorRating, color: 'linear-gradient(90deg, #2ecc71, #27ae60)' },
                                { label: 'สถานที่', value: results.summary.avgFacilityRating, color: 'linear-gradient(90deg, #9b59b6, #8e44ad)' },
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
