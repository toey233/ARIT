import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
    HiOutlineAcademicCap, HiOutlineClock, HiOutlineLocationMarker,
    HiOutlineUsers, HiOutlineUser, HiOutlineDocumentText,
    HiOutlineArrowLeft, HiOutlineCalendar, HiOutlineEye,
    HiOutlineClipboardList, HiOutlineUserGroup, HiOutlineLightBulb,
    HiOutlineCheckCircle, HiOutlineChevronRight
} from 'react-icons/hi';

const TABS = [
    { id: 'detail', label: 'รายละเอียด', icon: HiOutlineDocumentText },
    { id: 'topics', label: 'หัวข้อ', icon: HiOutlineClipboardList },
    { id: 'objectives', label: 'วัตถุประสงค์', icon: HiOutlineLightBulb },
    { id: 'target', label: 'กลุ่มเป้าหมาย', icon: HiOutlineUserGroup },
    { id: 'outcomes', label: 'ผลลัพธ์', icon: HiOutlineCheckCircle },
];

export default function CourseDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [activeTab, setActiveTab] = useState('detail');

    useEffect(() => {
        api.get(`/courses/${id}`).then(res => { setCourse(res.data); setLoading(false); }).catch(() => { setLoading(false); navigate('/courses'); });
    }, [id]);

    const handleRegister = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setRegistering(true);
        try {
            await api.post('/registrations', { courseId: id });
            toast.success('ลงทะเบียนสำเร็จ! รอการอนุมัติ');
            const res = await api.get(`/courses/${id}`);
            setCourse(res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'ลงทะเบียนไม่สำเร็จ');
        } finally {
            setRegistering(false);
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    const formatDateShort = (d) => d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : '';
    const formatTime = (d) => d ? new Date(d).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '';

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div style={{
                width: 48, height: 48, border: '4px solid #e2e8f0',
                borderTopColor: '#2563eb', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
    if (!course) return null;

    const registered = course.registeredCount || 0;
    const max = course.maxParticipants || 30;
    const progress = Math.min((registered / max) * 100, 100);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'detail':
                return (
                    <div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <HiOutlineDocumentText size={20} color="#2563eb" />
                            รายละเอียดโครงการ
                        </h3>
                        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                            {course.description}
                        </p>
                        {course.instructor && (
                            <div style={{ marginTop: 20, padding: 16, background: 'rgba(37,99,235,0.04)', borderRadius: 12, border: '1px solid rgba(37,99,235,0.08)' }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>วิทยากร:</span>
                                <span style={{ fontSize: 14, color: '#1e293b', marginLeft: 8, fontWeight: 500 }}>{course.instructor}</span>
                            </div>
                        )}
                        {(course.trainingDate || course.duration) && (
                            <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                {course.trainingDate && (
                                    <div style={{ flex: 1, minWidth: 180, padding: '12px 16px', background: 'rgba(245,158,11,0.06)', borderRadius: 12, border: '1px solid rgba(245,158,11,0.1)' }}>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>📅 วันที่ทำการอบรม:</span>
                                        <p style={{ fontSize: 14, color: '#1e293b', fontWeight: 500, marginTop: 4 }}>{course.trainingDate}</p>
                                    </div>
                                )}
                                {course.duration && (
                                    <div style={{ flex: 1, minWidth: 180, padding: '12px 16px', background: 'rgba(5,150,105,0.06)', borderRadius: 12, border: '1px solid rgba(5,150,105,0.1)' }}>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: '#065f46' }}>⏱ ระยะเวลาอบรม:</span>
                                        <p style={{ fontSize: 14, color: '#1e293b', fontWeight: 500, marginTop: 4 }}>{course.duration}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            case 'topics':
                return (
                    <div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <HiOutlineClipboardList size={20} color="#2563eb" />
                            หัวข้อการอบรม
                        </h3>
                        {course.topics ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {course.topics.split('\n').filter(line => line.trim()).map((line, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'flex-start', gap: 12,
                                        padding: '12px 16px', background: i % 2 === 0 ? 'rgba(37,99,235,0.03)' : 'transparent',
                                        borderRadius: 10,
                                    }}>
                                        <div style={{
                                            minWidth: 28, height: 28, borderRadius: 8,
                                            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#fff', fontSize: 12, fontWeight: 700, marginTop: 1,
                                        }}>{i + 1}</div>
                                        <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7 }}>{line.trim()}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ fontSize: 14, color: '#94a3b8' }}>ไม่มีข้อมูลหัวข้อการอบรม</p>
                        )}
                    </div>
                );
            case 'objectives':
                return (
                    <div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <HiOutlineLightBulb size={20} color="#f59e0b" />
                            วัตถุประสงค์
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[
                                'เพื่อพัฒนาทักษะและความรู้ด้านเทคโนโลยีสารสนเทศ',
                                'เพื่อเสริมสร้างความสามารถในการนำเทคโนโลยีไปประยุกต์ใช้',
                                'เพื่อสร้างเครือข่ายการเรียนรู้ระหว่างบุคลากร',
                            ].map((obj, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 12,
                                    padding: '14px 16px', background: '#f0fdf4',
                                    borderRadius: 12, border: '1px solid #bbf7d0',
                                }}>
                                    <HiOutlineCheckCircle size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: 1 }} />
                                    <p style={{ fontSize: 14, color: '#15803d', lineHeight: 1.6 }}>{obj}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'target':
                return (
                    <div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <HiOutlineUserGroup size={20} color="#8b5cf6" />
                            กลุ่มเป้าหมาย
                        </h3>
                        <div style={{
                            padding: '20px 24px', background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(37,99,235,0.04))',
                            borderRadius: 16, border: '1px solid rgba(139,92,246,0.1)',
                        }}>
                            <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.8 }}>
                                {course.category ? `สายวิชาการ : เพื่อ${course.category} และตำแหน่งทางวิชาการ` : 'บุคลากรทุกสายงานที่สนใจ'}
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                                {['อาจารย์', 'บุคลากร', 'นักศึกษา', 'บุคคลทั่วไป'].map(tag => (
                                    <span key={tag} style={{
                                        padding: '6px 16px', borderRadius: 50,
                                        fontSize: 12, fontWeight: 600, color: '#8b5cf6',
                                        background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.12)',
                                    }}>{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'outcomes':
                return (
                    <div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <HiOutlineCheckCircle size={20} color="#059669" />
                            ผลลัพธ์ที่คาดหวัง
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[
                                'ผู้เข้าอบรมมีความรู้ความเข้าใจในเนื้อหาหลักสูตร',
                                'สามารถประยุกต์ใช้ความรู้ในการทำงานจริงได้',
                                'ได้รับประกาศนียบัตรเมื่อผ่านการอบรม',
                            ].map((result, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '16px 20px', background: '#fff',
                                    borderRadius: 12, border: '1px solid #e2e8f0',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 10,
                                        background: 'linear-gradient(135deg, #059669, #10b981)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <span style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>{i + 1}</span>
                                    </div>
                                    <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6 }}>{result}</p>
                                </div>
                            ))}
                        </div>
                        {course.materials && (
                            <div style={{ marginTop: 20, padding: 16, background: 'rgba(37,99,235,0.04)', borderRadius: 12 }}>
                                <h4 style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>📋 เอกสาร/อุปกรณ์ที่ต้องเตรียม</h4>
                                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>{course.materials}</p>
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {/* ========== HERO BANNER ========== */}
            <div style={{
                background: 'linear-gradient(135deg, #1e3a5f 0%, #0d2137 50%, #0a1628 100%)',
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Decorative elements */}
                <div style={{
                    position: 'absolute', top: -80, right: -80, width: 300, height: 300,
                    borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)',
                }} />
                <div style={{
                    position: 'absolute', bottom: -50, left: '20%', width: 200, height: 200,
                    borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)',
                }} />

                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 0', position: 'relative', zIndex: 2 }}>
                    {/* Back button */}
                    <button onClick={() => navigate('/courses')} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '8px 16px', borderRadius: 10,
                        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500,
                        cursor: 'pointer', transition: 'all 0.3s',
                        marginBottom: 24,
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                    >
                        <HiOutlineArrowLeft size={16} />
                        ย้อนกลับ
                    </button>

                    <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', paddingBottom: 48, flexWrap: 'wrap' }}>
                        {/* Left: Course Info */}
                        <div style={{ flex: '1 1 500px', minWidth: 300 }}>
                            {/* Project title bar */}
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' }}>
                                โครงการการพัฒนาทักษะบุคลากรด้านเทคโนโลยีดิจิทัล
                            </p>

                            {/* Course Title */}
                            <h1 style={{
                                fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 800,
                                color: '#fff', lineHeight: 1.4, marginBottom: 20,
                            }}>
                                {course.title}
                            </h1>

                            {/* Target audience tag */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                                <span style={{
                                    padding: '6px 16px', borderRadius: 8,
                                    fontSize: 12, fontWeight: 700, color: '#fff',
                                    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                                }}>
                                    กลุ่มเป้าหมาย
                                </span>
                                <span style={{ color: '#93c5fd', fontSize: 13, fontWeight: 500 }}>
                                    ▶ {course.category || 'ทั่วไป'}
                                </span>
                            </div>

                            {/* Date & Instructor */}
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
                                <div>
                                    <div style={{
                                        fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: '#fff',
                                        lineHeight: 1.1,
                                    }}>
                                        {formatDateShort(course.startDate)}
                                        {course.endDate && course.startDate !== course.endDate && (
                                            <span> - {formatDateShort(course.endDate)}</span>
                                        )}
                                    </div>
                                </div>
                                <div style={{
                                    borderLeft: '3px solid rgba(255,255,255,0.2)',
                                    paddingLeft: 20, paddingBottom: 4,
                                }}>
                                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>วิทยากร:</p>
                                    <p style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{course.instructor || 'ไม่ระบุ'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Course Image */}
                        <div style={{ flex: '0 1 360px', minWidth: 280 }}>
                            {course.image ? (
                                <div style={{
                                    borderRadius: 16, overflow: 'hidden',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                                    border: '2px solid rgba(255,255,255,0.1)',
                                }}>
                                    <img src={course.image} alt={course.title} style={{
                                        width: '100%', height: 220, objectFit: 'cover',
                                    }} />
                                </div>
                            ) : (
                                <div style={{
                                    height: 220, borderRadius: 16,
                                    background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(139,92,246,0.2))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '2px solid rgba(255,255,255,0.1)',
                                }}>
                                    <HiOutlineAcademicCap size={64} color="rgba(255,255,255,0.3)" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ========== QUICK INFO BAR ========== */}
            <div style={{
                background: '#fff', borderBottom: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
                <div style={{
                    maxWidth: 1200, margin: '0 auto', padding: '0 24px',
                    display: 'flex', alignItems: 'center', gap: 8,
                    flexWrap: 'wrap',
                }}>
                    {[
                        { icon: HiOutlineCalendar, label: 'วันที่อบรม', value: course.trainingDate || `${formatDate(course.startDate)}${course.endDate ? ' - ' + formatDate(course.endDate) : ''}`, color: '#2563eb' },
                        { icon: HiOutlineClock, label: 'ระยะเวลา', value: course.duration || `${formatTime(course.startDate)} - ${formatTime(course.endDate)}`, color: '#f59e0b' },
                        { icon: HiOutlineLocationMarker, label: 'สถานที่', value: course.location || 'ไม่ระบุ', color: '#059669' },
                    ].map((info, i) => (
                        <div key={i} style={{
                            flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 12,
                            padding: '16px 20px',
                            borderRight: i < 2 ? '1px solid #f1f5f9' : 'none',
                        }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 10,
                                background: `${info.color}10`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <info.icon size={18} color={info.color} />
                            </div>
                            <div>
                                <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, marginBottom: 2 }}>{info.label}</p>
                                <p style={{ fontSize: 13, color: '#1e293b', fontWeight: 600 }}>{info.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Views counter */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 13 }}>
                    <HiOutlineEye size={16} />
                    <span>{registered > 0 ? registered * 3 + 47 : 47} ผู้เข้าชม</span>
                </div>
            </div>

            {/* ========== CONTENT AREA ========== */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 60px' }}>
                <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {/* Left: Tabs & Content */}
                    <div style={{ flex: '1 1 600px', minWidth: 300 }}>
                        {/* Tab Navigation */}
                        <div style={{
                            display: 'flex', gap: 0, borderBottom: '2px solid #e2e8f0',
                            marginBottom: 28, overflowX: 'auto',
                        }}>
                            {TABS.map(tab => {
                                const isActive = activeTab === tab.id;
                                const Icon = tab.icon;
                                return (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '14px 20px', fontSize: 13, fontWeight: isActive ? 700 : 500,
                                        color: isActive ? '#2563eb' : '#94a3b8',
                                        background: 'none', border: 'none',
                                        borderBottom: isActive ? '3px solid #2563eb' : '3px solid transparent',
                                        cursor: 'pointer', transition: 'all 0.3s',
                                        whiteSpace: 'nowrap', marginBottom: -2,
                                    }}
                                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#64748b'; }}
                                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#94a3b8'; }}
                                    >
                                        <Icon size={16} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tab Content */}
                        <div style={{
                            background: '#fff', borderRadius: 16, padding: '28px 28px',
                            border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            animation: 'fadeIn 0.3s ease',
                        }}>
                            {renderTabContent()}
                        </div>
                    </div>

                    {/* Right: Registration Sidebar */}
                    <div style={{ flex: '0 1 320px', minWidth: 280 }}>
                        <div style={{
                            background: '#fff', borderRadius: 16, overflow: 'hidden',
                            border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                            position: 'sticky', top: 24,
                        }}>
                            {/* Header */}
                            <div style={{
                                padding: '16px 20px',
                                background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
                                borderBottom: '1px solid #bbf7d0',
                            }}>
                                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#166534' }}>
                                    รุ่นที่เปิดอบรม
                                </h3>
                            </div>

                            <div style={{ padding: '20px' }}>
                                {/* Batch info */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    marginBottom: 16,
                                }}>
                                    <span style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
                                        รุ่นที่ 1
                                    </span>
                                    <span style={{
                                        padding: '4px 12px', borderRadius: 50,
                                        fontSize: 11, fontWeight: 700,
                                        background: course.status === 'open' ? '#dcfce7' : '#fecaca',
                                        color: course.status === 'open' ? '#16a34a' : '#dc2626',
                                    }}>
                                        {course.status === 'open' ? 'เปิดรับสมัคร' : 'ปิดรับสมัคร'}
                                    </span>
                                </div>

                                {/* Date info */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '10px 0', fontSize: 13, color: '#64748b',
                                }}>
                                    <HiOutlineCalendar size={16} color="#2563eb" />
                                    <span>{formatDate(course.startDate)} - {formatDate(course.endDate)}</span>
                                </div>

                                {/* Registration count */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '10px 0', fontSize: 13, color: '#64748b',
                                }}>
                                    <HiOutlineUsers size={16} color="#2563eb" />
                                    <span>ผู้สมัคร</span>
                                    <span style={{ marginLeft: 'auto', fontWeight: 700, color: '#1e293b' }}>
                                        {registered} / {max}
                                    </span>
                                </div>

                                {/* Progress bar */}
                                <div style={{
                                    height: 8, borderRadius: 10, background: '#e2e8f0', overflow: 'hidden',
                                    marginTop: 4, marginBottom: 20,
                                }}>
                                    <div style={{
                                        height: '100%', borderRadius: 10,
                                        width: `${progress}%`,
                                        background: progress > 80
                                            ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                                            : 'linear-gradient(90deg, #16a34a, #22c55e)',
                                        transition: 'width 1s ease-out',
                                    }} />
                                </div>

                                {/* Register Button */}
                                {course.status === 'open' && (!user || user.role === 'user') && (
                                    <button onClick={handleRegister} disabled={registering} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        gap: 8, width: '100%', padding: '14px 0', borderRadius: 12,
                                        fontSize: 15, fontWeight: 700, color: '#fff',
                                        background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                                        border: 'none', cursor: registering ? 'not-allowed' : 'pointer',
                                        boxShadow: '0 4px 15px rgba(22,163,74,0.3)',
                                        transition: 'all 0.3s',
                                        opacity: registering ? 0.7 : 1,
                                    }}
                                        onMouseEnter={e => { if (!registering) { e.target.style.boxShadow = '0 8px 30px rgba(22,163,74,0.4)'; e.target.style.transform = 'translateY(-2px)'; } }}
                                        onMouseLeave={e => { e.target.style.boxShadow = '0 4px 15px rgba(22,163,74,0.3)'; e.target.style.transform = 'translateY(0)'; }}
                                    >
                                        {registering ? (
                                            <div style={{
                                                width: 20, height: 20, border: '3px solid rgba(255,255,255,0.3)',
                                                borderTopColor: '#fff', borderRadius: '50%',
                                                animation: 'spin 0.8s linear infinite',
                                            }} />
                                        ) : (
                                            <>
                                                {user ? 'ลงทะเบียนอบรม' : 'เข้าสู่ระบบเพื่อลงทะเบียน'}
                                                <HiOutlineChevronRight size={16} />
                                            </>
                                        )}
                                    </button>
                                )}

                                {course.status !== 'open' && (
                                    <div style={{
                                        textAlign: 'center', padding: '14px 0',
                                        fontSize: 14, fontWeight: 600, color: '#dc2626',
                                        background: '#fef2f2', borderRadius: 12,
                                    }}>
                                        ปิดรับสมัครแล้ว
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
