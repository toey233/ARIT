import { useState } from 'react';
import {
    HiOutlineX, HiOutlineCalendar, HiOutlineLocationMarker,
    HiOutlineUsers, HiOutlineAcademicCap, HiOutlineDocumentText,
    HiOutlineClipboardList, HiOutlineLightBulb, HiOutlineCheckCircle,
    HiOutlineChevronRight, HiOutlineClock, HiOutlineUserGroup,
    HiOutlineDownload
} from 'react-icons/hi';
import ExcelJS from 'exceljs';
import api from '../services/api';
import toast from 'react-hot-toast';

const TABS = [
    { id: 'detail', label: 'รายละเอียด', icon: HiOutlineDocumentText },
    { id: 'topics', label: 'หัวข้อ', icon: HiOutlineClipboardList },
    { id: 'objectives', label: 'วัตถุประสงค์', icon: HiOutlineLightBulb },
    { id: 'target', label: 'กลุ่มเป้าหมาย', icon: HiOutlineUserGroup },
];

export default function CourseDetailModal({ course, user, onClose, onRegister }) {
    const [activeTab, setActiveTab] = useState('detail');

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    const formatDateShort = (d) => d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : '';
    const formatTime = (d) => d ? new Date(d).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '';

    const registered = course.registeredCount || 0;
    const max = course.maxParticipants || 30;
    const remaining = max - registered;
    const progress = Math.min((registered / max) * 100, 100);

    const downloadExcel = async () => {
        try {
            const res = await api.get('/registrations');
            const courseRegs = res.data.filter(r => r.courseId === course.id);

            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('ผู้สมัครอบรม');

            // Header styling
            sheet.columns = [
                { header: 'ลำดับ', key: 'no', width: 8 },
                { header: 'ชื่อ-สกุล', key: 'name', width: 28 },
                { header: 'รหัสนักศึกษา', key: 'studentId', width: 18 },
                { header: 'อีเมล', key: 'email', width: 30 },
                { header: 'วันที่สมัคร', key: 'date', width: 20 },
                { header: 'สถานะ', key: 'status', width: 14 },
            ];

            // Title row
            sheet.insertRow(1, [`รายชื่อผู้สมัคร: ${course.title}`]);
            sheet.mergeCells('A1:F1');
            sheet.getRow(1).font = { bold: true, size: 14 };
            sheet.getRow(1).alignment = { horizontal: 'center' };
            sheet.getRow(1).height = 30;

            // Style header row (now row 2)
            const headerRow = sheet.getRow(2);
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
            headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
            headerRow.height = 24;

            // Data rows
            courseRegs.forEach((reg, i) => {
                const statusMap = { approved: 'อนุมัติ', rejected: 'ปฏิเสธ', pending: 'รออนุมัติ' };
                sheet.addRow({
                    no: i + 1,
                    name: reg.userName || '-',
                    studentId: reg.userStudentId || '-',
                    email: reg.userEmail || '-',
                    date: reg.registeredAt ? new Date(reg.registeredAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
                    status: statusMap[reg.status] || reg.status,
                });
            });

            // Style data rows
            for (let i = 3; i <= sheet.rowCount; i++) {
                const row = sheet.getRow(i);
                row.alignment = { horizontal: 'center', vertical: 'middle' };
                row.getCell(2).alignment = { horizontal: 'left' };
                row.getCell(4).alignment = { horizontal: 'left' };
                if (i % 2 === 1) {
                    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F4FF' } };
                }
            }

            // Border all cells
            sheet.eachRow((row, rowNum) => {
                if (rowNum >= 2) {
                    row.eachCell(cell => {
                        cell.border = {
                            top: { style: 'thin' }, left: { style: 'thin' },
                            bottom: { style: 'thin' }, right: { style: 'thin' },
                        };
                    });
                }
            });

            // Summary row
            const summaryRow = sheet.addRow([`รวมทั้งหมด ${courseRegs.length} คน (อนุมัติ: ${courseRegs.filter(r => r.status === 'approved').length}, รออนุมัติ: ${courseRegs.filter(r => r.status === 'pending').length}, ปฏิเสธ: ${courseRegs.filter(r => r.status === 'rejected').length})`]);
            sheet.mergeCells(`A${summaryRow.number}:F${summaryRow.number}`);
            summaryRow.font = { bold: true, size: 11 };
            summaryRow.alignment = { horizontal: 'center' };

            const buf = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ผู้สมัคร_${course.title}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('ดาวน์โหลดสำเร็จ');
        } catch (err) {
            console.error(err);
            toast.error('ดาวน์โหลดไม่สำเร็จ');
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'detail':
                return (
                    <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <HiOutlineDocumentText size={18} color="#2563eb" />
                            รายละเอียดโครงการ
                        </h3>
                        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                            {course.description || 'ไม่มีรายละเอียด'}
                        </p>
                        {course.instructor && (
                            <div style={{ marginTop: 16, padding: 14, background: 'rgba(37,99,235,0.04)', borderRadius: 10, border: '1px solid rgba(37,99,235,0.08)' }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>วิทยากร:</span>
                                <span style={{ fontSize: 14, color: '#1e293b', marginLeft: 8, fontWeight: 500 }}>{course.instructor}</span>
                            </div>
                        )}
                        {(course.trainingDate || course.duration) && (
                            <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {course.trainingDate && (
                                    <div style={{ flex: 1, minWidth: 160, padding: '10px 14px', background: 'rgba(245,158,11,0.06)', borderRadius: 10, border: '1px solid rgba(245,158,11,0.1)' }}>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: '#92400e' }}>📅 วันที่ทำการอบรม</span>
                                        <p style={{ fontSize: 13, color: '#1e293b', fontWeight: 500, marginTop: 3 }}>{course.trainingDate}</p>
                                    </div>
                                )}
                                {course.duration && (
                                    <div style={{ flex: 1, minWidth: 160, padding: '10px 14px', background: 'rgba(5,150,105,0.06)', borderRadius: 10, border: '1px solid rgba(5,150,105,0.1)' }}>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: '#065f46' }}>⏱ ระยะเวลาอบรม</span>
                                        <p style={{ fontSize: 13, color: '#1e293b', fontWeight: 500, marginTop: 3 }}>{course.duration}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            case 'topics':
                return (
                    <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <HiOutlineClipboardList size={18} color="#2563eb" />
                            หัวข้อการอบรม
                        </h3>
                        {course.topics ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {course.topics.split('\n').filter(line => line.trim()).map((line, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'flex-start', gap: 10,
                                        padding: '10px 14px', background: i % 2 === 0 ? 'rgba(37,99,235,0.03)' : 'transparent',
                                        borderRadius: 8,
                                    }}>
                                        <div style={{
                                            minWidth: 24, height: 24, borderRadius: 6,
                                            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#fff', fontSize: 11, fontWeight: 700, marginTop: 1,
                                        }}>{i + 1}</div>
                                        <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{line.trim()}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ fontSize: 13, color: '#94a3b8' }}>ไม่มีข้อมูลหัวข้อการอบรม</p>
                        )}
                    </div>
                );
            case 'objectives':
                return (
                    <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <HiOutlineLightBulb size={18} color="#f59e0b" />
                            วัตถุประสงค์
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[
                                'เพื่อพัฒนาทักษะและความรู้ด้านเทคโนโลยีสารสนเทศ',
                                'เพื่อเสริมสร้างความสามารถในการนำเทคโนโลยีไปประยุกต์ใช้',
                                'เพื่อสร้างเครือข่ายการเรียนรู้ระหว่างบุคลากร',
                            ].map((obj, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 10,
                                    padding: '12px 14px', background: '#f0fdf4',
                                    borderRadius: 10, border: '1px solid #bbf7d0',
                                }}>
                                    <HiOutlineCheckCircle size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: 1 }} />
                                    <p style={{ fontSize: 13, color: '#15803d', lineHeight: 1.5 }}>{obj}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'target':
                return (
                    <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <HiOutlineUserGroup size={18} color="#8b5cf6" />
                            กลุ่มเป้าหมาย
                        </h3>
                        <div style={{
                            padding: '16px 20px', background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(37,99,235,0.04))',
                            borderRadius: 12, border: '1px solid rgba(139,92,246,0.1)',
                        }}>
                            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, marginBottom: 10 }}>
                                {course.category ? `สายวิชาการ : เพื่อ${course.category} และตำแหน่งทางวิชาการ` : 'บุคลากรทุกสายงานที่สนใจ'}
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {['อาจารย์', 'บุคลากร', 'นักศึกษา', 'บุคคลทั่วไป'].map(tag => (
                                    <span key={tag} style={{
                                        padding: '5px 14px', borderRadius: 50,
                                        fontSize: 11, fontWeight: 600, color: '#8b5cf6',
                                        background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.12)',
                                    }}>{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
        }} onClick={onClose}>
            <div style={{
                background: '#fff', borderRadius: 20, width: '92%', maxWidth: 680, maxHeight: '90vh',
                overflow: 'hidden', position: 'relative',
                boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
                animation: 'modalPopIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                display: 'flex', flexDirection: 'column',
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #1e3a5f 0%, #0d2137 100%)',
                    padding: '24px 28px 20px', position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{
                        position: 'absolute', top: -30, right: -30, width: 120, height: 120,
                        borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)',
                    }} />
                    <button onClick={onClose} style={{
                        position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.1)',
                        border: 'none', cursor: 'pointer', color: '#fff', padding: 6, borderRadius: 8,
                        transition: 'background 0.2s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    >
                        <HiOutlineX size={20} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <span style={{
                            padding: '4px 12px', borderRadius: 50, fontSize: 11, fontWeight: 700,
                            background: course.status === 'open' ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)',
                            color: '#fff',
                        }}>
                            {course.status === 'open' ? '🟢 เปิดรับสมัคร' : '🔴 ปิดรับสมัคร'}
                        </span>
                        <span style={{
                            padding: '4px 12px', borderRadius: 50, fontSize: 11, fontWeight: 600,
                            background: 'rgba(37,99,235,0.2)', color: '#93c5fd',
                        }}>
                            {course.category || 'ทั่วไป'}
                        </span>
                    </div>

                    <h2 style={{
                        fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1.4, marginBottom: 12,
                        paddingRight: 32,
                    }}>
                        {course.title}
                    </h2>

                    {/* Date big display */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>
                            {course.trainingDate || formatDateShort(course.startDate)}
                        </div>
                        {course.instructor && (
                            <div style={{ borderLeft: '2px solid rgba(255,255,255,0.2)', paddingLeft: 16 }}>
                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>วิทยากร</p>
                                <p style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{course.instructor}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Info Bar */}
                <div style={{
                    display: 'flex', gap: 0, borderBottom: '1px solid #e2e8f0',
                    background: '#fafbfc', flexWrap: 'wrap',
                }}>
                    {[
                        { icon: HiOutlineCalendar, value: course.trainingDate ? `อบรม: ${course.trainingDate}` : formatDate(course.startDate), color: '#2563eb' },
                        { icon: HiOutlineClock, value: course.startDate && new Date(course.startDate) < new Date() ? 'หมดเขตลงทะเบียน' : (course.duration || `ลงทะเบียนถึง: ${formatDate(course.startDate)}`), color: course.startDate && new Date(course.startDate) < new Date() ? '#dc2626' : '#f59e0b' },
                        { icon: HiOutlineLocationMarker, value: course.location || 'ไม่ระบุ', color: '#059669' },
                    ].map((info, i) => (
                        <div key={i} style={{
                            flex: 1, minWidth: 140, display: 'flex', alignItems: 'center', gap: 8,
                            padding: '10px 14px', borderRight: i < 2 ? '1px solid #f1f5f9' : 'none',
                        }}>
                            <info.icon size={15} color={info.color} />
                            <span style={{ fontSize: 12, color: info.color === '#dc2626' ? '#dc2626' : '#475569', fontWeight: info.color === '#dc2626' ? 700 : 500 }}>{info.value}</span>
                        </div>
                    ))}
                </div>

                {/* Scrollable content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
                    {/* Tabs */}
                    <div style={{
                        display: 'flex', gap: 0, borderBottom: '2px solid #e2e8f0',
                        padding: '0 20px', overflowX: 'auto', background: '#fff',
                    }}>
                        {TABS.map(tab => {
                            const isActive = activeTab === tab.id;
                            const Icon = tab.icon;
                            return (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    padding: '12px 16px', fontSize: 12, fontWeight: isActive ? 700 : 500,
                                    color: isActive ? '#2563eb' : '#94a3b8',
                                    background: 'none', border: 'none',
                                    borderBottom: isActive ? '3px solid #2563eb' : '3px solid transparent',
                                    cursor: 'pointer', transition: 'all 0.3s',
                                    whiteSpace: 'nowrap', marginBottom: -2,
                                }}>
                                    <Icon size={14} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    <div style={{ padding: '20px 24px' }}>
                        {renderTabContent()}
                    </div>

                    {/* Registration info */}
                    <div style={{ padding: '0 24px 20px' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
                            borderRadius: 14, padding: '16px 20px',
                            border: '1px solid #bbf7d0',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#166534' }}>
                                    รุ่นที่ 1
                                </span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#2563eb' }}>
                                    <HiOutlineUsers size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                    {registered}/{max} คน
                                </span>
                            </div>
                            <div style={{ height: 7, borderRadius: 10, background: '#e2e8f0', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%', borderRadius: 10,
                                    width: `${progress}%`,
                                    background: progress > 80
                                        ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                                        : 'linear-gradient(90deg, #16a34a, #22c55e)',
                                    transition: 'width 1s ease-out',
                                }} />
                            </div>
                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 6, textAlign: 'right' }}>
                                ว่างอีก <strong style={{ color: remaining > 5 ? '#10b981' : '#ef4444' }}>{remaining}</strong> ที่
                            </div>
                        </div>

                        {/* Download Excel Button for Staff/Admin */}
                        {user && (user.role === 'staff' || user.role === 'admin') && (
                            <button onClick={downloadExcel} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: 8, width: '100%', padding: '12px 0', borderRadius: 12,
                                fontSize: 14, fontWeight: 600, color: '#fff', marginTop: 12,
                                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                                border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                                boxShadow: '0 4px 15px rgba(37,99,235,0.3)',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 30px rgba(37,99,235,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 15px rgba(37,99,235,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                <HiOutlineDownload size={18} />
                                ดาวน์โหลดรายชื่อผู้สมัคร (Excel)
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer with Register Button - only for users */}
                {(!user || user.role === 'user') && course.status === 'open' && !(course.startDate && new Date(course.startDate) < new Date()) && (
                    <div style={{
                        padding: '16px 24px', borderTop: '1px solid #e2e8f0',
                        background: '#fff',
                    }}>
                        <button onClick={onRegister} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: 8, width: '100%', padding: '14px 0', borderRadius: 12,
                            fontSize: 15, fontWeight: 700, color: '#fff',
                            background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                            border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                            boxShadow: '0 4px 15px rgba(22,163,74,0.3)',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 30px rgba(22,163,74,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 15px rgba(22,163,74,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <HiOutlineClipboardList size={18} />
                            ลงทะเบียนอบรม
                            <HiOutlineChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes modalPopIn {
                    from { opacity: 0; transform: scale(0.9) translateY(20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
}
