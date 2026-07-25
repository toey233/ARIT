// นำเข้าไลบรารีที่จำเป็นสำหรับหน้าพิมพ์สรุปประวัติการอบรม (Transcript)
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HiOutlinePrinter } from 'react-icons/hi';

// คอมโพเนนต์สำหรับสร้างและพิมพ์ใบประวัติการอบรมรวมทั้งหมดของผู้ใช้
export default function Transcript() {
    const { user } = useAuth();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    // โหลดข้อมูลเฉพาะหลักสูตรที่ผู้ใช้งานผ่านการอนุมัติแล้วมาแสดง
    useEffect(() => {
        if (!user) return;
        api.get('/registrations')
            .then(res => {
                // Filter only approved courses
                const approved = res.data.filter(r => r.status === 'approved');
                // Sort by date ascending (oldest first)
                approved.sort((a, b) => new Date(a.courseStartDate) - new Date(b.courseStartDate));
                setRegistrations(approved);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [user]);

    if (loading || !user) {
        return <div className="min-h-screen flex items-center justify-center bg-surface-50 text-surface-600">กำลังโหลดข้อมูล...</div>;
    }

    let totalHours = 0;
    registrations.forEach(r => {
        const hours = parseFloat(r.courseDuration);
        if (!isNaN(hours)) {
            totalHours += hours;
        }
    });

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const d = new Date(dateString);
        return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // ฟังก์ชันสำหรับกดปุ่มพิมพ์ (Print) เพื่อบันทึกเป็น PDF หรือพิมพ์ลงกระดาษ
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-surface-100 py-10 print:bg-white print:py-0 font-sans">
            <style>{`
                @media print {
                    @page { margin: 20mm; size: A4; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    .print-container { box-shadow: none !important; margin: 0 !important; padding: 0 !important; max-width: 100% !important; border: none !important; }
                }
            `}</style>

            {/* Action Bar */}
            <div className="max-w-4xl mx-auto mb-6 flex justify-end no-print px-4">
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 transition-all"
                >
                    <HiOutlinePrinter className="w-5 h-5" />
                    พิมพ์ / บันทึกเป็น PDF
                </button>
            </div>

            {/* A4 Paper Container */}
            <div className="max-w-4xl mx-auto bg-white shadow-2xl print-container p-12 min-h-[297mm] border border-surface-200">
                
                {/* Header */}
                <div className="text-center mb-10 border-b-2 border-surface-800 pb-6">
                    <h1 className="text-3xl font-bold text-surface-900 mb-2">สรุปประวัติการอบรม (Training Transcript)</h1>
                    <p className="text-surface-600 text-lg">ศูนย์วิทยบริการและเทคโนโลยีสารสนเทศ (ARIT)</p>
                </div>

                {/* User Info */}
                <div className="mb-10 grid grid-cols-2 gap-4 text-surface-800 text-sm">
                    <div>
                        <span className="font-bold mr-2">ชื่อ-นามสกุล:</span>
                        {user.firstName} {user.lastName}
                    </div>
                    <div>
                        <span className="font-bold mr-2">รหัสประจำตัว:</span>
                        {user.studentId || '-'}
                    </div>
                    <div>
                        <span className="font-bold mr-2">หน่วยงาน/คณะ:</span>
                        {user.department || '-'}
                    </div>
                    <div>
                        <span className="font-bold mr-2">วันที่ออกเอกสาร:</span>
                        {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                </div>

                {/* Summary Box */}
                <div className="bg-surface-50 border border-surface-200 rounded-lg p-6 mb-10 flex justify-around text-center">
                    <div>
                        <p className="text-sm text-surface-500 font-semibold mb-1">จำนวนหลักสูตรที่ผ่านการอบรม</p>
                        <p className="text-3xl font-bold text-primary-600">{registrations.length} <span className="text-lg font-medium text-surface-600">หลักสูตร</span></p>
                    </div>
                    <div className="w-px bg-surface-300"></div>
                    <div>
                        <p className="text-sm text-surface-500 font-semibold mb-1">จำนวนชั่วโมงรวม</p>
                        <p className="text-3xl font-bold text-emerald-600">{totalHours} <span className="text-lg font-medium text-surface-600">ชั่วโมง</span></p>
                    </div>
                </div>

                {/* Table */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-surface-900 mb-4 border-l-4 border-primary-600 pl-3">รายละเอียดหลักสูตรที่ผ่านการอบรม</h3>
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-surface-100 border-y border-surface-300">
                                <th className="py-3 px-4 font-bold text-surface-800 w-12 text-center">ลำดับ</th>
                                <th className="py-3 px-4 font-bold text-surface-800">ชื่อหลักสูตร</th>
                                <th className="py-3 px-4 font-bold text-surface-800 w-40 text-center">วันที่อบรม</th>
                                <th className="py-3 px-4 font-bold text-surface-800 w-24 text-center">ชั่วโมง</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registrations.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-8 text-center text-surface-500">
                                        ยังไม่มีประวัติการอบรมที่ได้รับการอนุมัติ
                                    </td>
                                </tr>
                            ) : (
                                registrations.map((reg, index) => (
                                    <tr key={reg.id} className="border-b border-surface-200">
                                        <td className="py-3 px-4 text-center text-surface-600">{index + 1}</td>
                                        <td className="py-3 px-4 text-surface-900 font-medium">{reg.courseName}</td>
                                        <td className="py-3 px-4 text-center text-surface-600">
                                            {formatDate(reg.courseStartDate)}
                                        </td>
                                        <td className="py-3 px-4 text-center text-surface-900 font-semibold">
                                            {reg.courseDuration || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Signature placeholder */}
                <div className="mt-20 flex justify-end">
                    <div className="text-center w-64">
                        <div className="border-b border-surface-400 mb-2 h-10"></div>
                        <p className="text-sm text-surface-700">ผู้อำนวยการศูนย์วิทยบริการฯ</p>
                        <p className="text-xs text-surface-500 mt-1">ผู้รับรองเอกสาร</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
