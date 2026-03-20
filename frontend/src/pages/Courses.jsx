import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import CourseDetailModal from '../components/CourseDetailModal';
import {
    HiOutlineAcademicCap, HiOutlineClock, HiOutlineLocationMarker,
    HiOutlineUsers, HiOutlineSearch, HiOutlineEye, HiOutlineCalendar,
    HiOutlineChevronRight, HiOutlineFilter
} from 'react-icons/hi';

const CATEGORY_COLORS = {
    'คอมพิวเตอร์': '#c0392b',
    'การพัฒนาเว็บ': '#2980b9',
    'วิเคราะห์ข้อมูล': '#8e44ad',
    'การศึกษา': '#27ae60',
    'ทั่วไป': '#2563eb',
};

const getCatColor = (cat) => CATEGORY_COLORS[cat] || '#2563eb';

export default function Courses() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [showCourseDetail, setShowCourseDetail] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/courses').then(res => { setCourses(res.data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const categories = [...new Set(courses.map(c => c.category))];
    const filtered = courses.filter(c => {
        const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase());
        const matchCat = !categoryFilter || c.category === categoryFilter;
        return matchSearch && matchCat;
    });

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

    const handleRegister = async (courseId) => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            await api.post('/registrations', { courseId });
            toast.success('ลงทะเบียนสำเร็จ! รอการอนุมัติ');
            const res = await api.get('/courses');
            setCourses(res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'ลงทะเบียนไม่สำเร็จ');
        }
    };

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

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f0f4ff 0%, #ffffff 100%)' }}>
            {/* Header Section */}
            <div style={{
                background: 'linear-gradient(135deg, #1e3a5f 0%, #0d2137 60%, #0a1628 100%)',
                padding: '48px 24px 56px',
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Decorative circles */}
                <div style={{
                    position: 'absolute', top: -60, right: -60, width: 200, height: 200,
                    borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)',
                }} />
                <div style={{
                    position: 'absolute', bottom: -40, left: -40, width: 160, height: 160,
                    borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)',
                }} />

                <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 2 }}>
                    <div style={{ textAlign: 'center' }}>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '6px 18px', borderRadius: 50,
                            fontSize: 12, fontWeight: 600, color: '#93c5fd',
                            background: 'rgba(147,197,253,0.1)', border: '1px solid rgba(147,197,253,0.15)',
                            marginBottom: 16, letterSpacing: 0.5,
                        }}>
                            <HiOutlineAcademicCap size={14} />
                            TRAINING COURSES
                        </span>
                        <h1 style={{
                            fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, color: '#fff',
                            marginBottom: 8, letterSpacing: '-0.5px',
                        }}>
                            หลักสูตรการอบรมทั้งหมด
                        </h1>
                        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', maxWidth: 500, margin: '0 auto' }}>
                            เลือกหลักสูตรที่สนใจและลงทะเบียนเข้าอบรมได้ทันที
                        </p>
                    </div>

                    {/* Search & Filter */}
                    <div style={{
                        display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32,
                        flexWrap: 'wrap',
                    }}>
                        <div style={{ position: 'relative', flex: '0 1 400px' }}>
                            <HiOutlineSearch size={18} style={{
                                position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                                color: '#94a3b8',
                            }} />
                            <input
                                type="text" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="ค้นหาหลักสูตร..."
                                style={{
                                    width: '100%', padding: '12px 16px 12px 44px', borderRadius: 12,
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.08)', color: '#fff',
                                    fontSize: 14, outline: 'none', backdropFilter: 'blur(8px)',
                                    transition: 'border-color 0.3s',
                                }}
                                onFocus={e => e.target.style.borderColor = 'rgba(147,197,253,0.4)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <HiOutlineFilter size={16} style={{
                                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                color: '#94a3b8', pointerEvents: 'none',
                            }} />
                            <select
                                value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                                style={{
                                    padding: '12px 24px 12px 38px', borderRadius: 12,
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.08)', color: '#fff',
                                    fontSize: 14, outline: 'none', cursor: 'pointer',
                                    backdropFilter: 'blur(8px)', appearance: 'none',
                                    minWidth: 160,
                                }}
                            >
                                <option value="" style={{ color: '#333' }}>ทุกหมวดหมู่</option>
                                {categories.map(c => <option key={c} value={c} style={{ color: '#333' }}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Stats */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '20px 0', flexWrap: 'wrap', gap: 12,
                }}>
                    <span style={{ fontSize: 15, color: '#64748b', fontWeight: 500 }}>
                        พบ <strong style={{ color: '#2563eb' }}>{filtered.length}</strong> หลักสูตร
                        {categoryFilter && <> ในหมวดหมู่ <strong style={{ color: '#2563eb' }}>{categoryFilter}</strong></>}
                    </span>
                </div>
            </div>

            {/* Course Grid */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 60px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                    gap: 24,
                }}>
                    {filtered.map((course, idx) => {
                        const catColor = getCatColor(course.category);
                        const registered = course.registeredCount || 0;
                        const max = course.maxParticipants || 30;
                        const remaining = max - registered;
                        const progress = Math.min((registered / max) * 100, 100);

                        return (
                            <div key={course.id} style={{
                                background: '#fff', borderRadius: 20, overflow: 'hidden',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                border: '1px solid rgba(0,0,0,0.04)',
                                display: 'flex', flexDirection: 'column',
                                animation: `fadeSlideUp 0.6s ease-out ${idx * 0.08}s both`,
                            }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)';
                                    e.currentTarget.style.boxShadow = `0 20px 50px ${catColor}18, 0 8px 20px rgba(0,0,0,0.08)`;
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
                                }}
                            >
                                {/* Course Image */}
                                <div style={{
                                    height: 200, position: 'relative', overflow: 'hidden',
                                    background: course.image ? '#f5f5f5' : `linear-gradient(135deg, ${catColor}15, ${catColor}30)`,
                                }}>
                                    {course.image ? (
                                        <img src={course.image} alt={course.title} style={{
                                            width: '100%', height: '100%', objectFit: 'cover',
                                            transition: 'transform 0.5s ease',
                                        }}
                                            onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
                                            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                                        />
                                    ) : (
                                        <div style={{
                                            position: 'absolute', inset: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: `linear-gradient(135deg, ${catColor}10, ${catColor}25)`,
                                        }}>
                                            <div style={{
                                                width: 80, height: 80, borderRadius: 20,
                                                background: `${catColor}15`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                animation: 'pulse 3s ease-in-out infinite',
                                            }}>
                                                <HiOutlineAcademicCap size={40} color={catColor} style={{ opacity: 0.6 }} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Bottom gradient */}
                                    <div style={{
                                        position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
                                    }} />

                                    {/* Category badge */}
                                    <span style={{
                                        position: 'absolute', top: 14, left: 14,
                                        padding: '5px 14px', borderRadius: 50,
                                        fontSize: 11, fontWeight: 700, color: '#fff',
                                        background: `linear-gradient(135deg, ${catColor}, ${catColor}cc)`,
                                        boxShadow: `0 2px 10px ${catColor}40`,
                                        backdropFilter: 'blur(4px)', letterSpacing: 0.3,
                                    }}>
                                        {course.category}
                                    </span>

                                    {/* Status ribbon */}
                                    <span style={{
                                        position: 'absolute', top: 14, right: 14,
                                        padding: '5px 12px', borderRadius: 50,
                                        fontSize: 10, fontWeight: 700, color: '#fff',
                                        background: course.status === 'open'
                                            ? (remaining > 10 ? 'rgba(16,185,129,0.9)' : 'rgba(245,158,11,0.9)')
                                            : 'rgba(239,68,68,0.9)',
                                        backdropFilter: 'blur(4px)',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                    }}>
                                        {course.status === 'open'
                                            ? (remaining > 10 ? '🟢 เปิดรับสมัคร' : '🟡 ใกล้เต็ม')
                                            : '🔴 ปิดรับสมัคร'}
                                    </span>
                                </div>

                                {/* Course Info */}
                                <div style={{ padding: '20px 22px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{
                                        fontSize: 16, fontWeight: 700, color: '#1e293b',
                                        marginBottom: 14, lineHeight: 1.5,
                                        display: '-webkit-box', WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                    }}>
                                        {course.title}
                                    </h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                                        {course.trainingDate && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{
                                                    width: 28, height: 28, borderRadius: 8,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: 'rgba(37,99,235,0.08)', flexShrink: 0,
                                                }}>
                                                    <HiOutlineCalendar size={14} color="#2563eb" />
                                                </div>
                                                <span style={{ fontWeight: 600, color: '#1e293b' }}>อบรม: {course.trainingDate}</span>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{
                                                width: 28, height: 28, borderRadius: 8,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: course.startDate && new Date(course.startDate) < new Date() ? 'rgba(220,38,38,0.08)' : 'rgba(245,158,11,0.08)', flexShrink: 0,
                                            }}>
                                                <HiOutlineClock size={14} color={course.startDate && new Date(course.startDate) < new Date() ? '#dc2626' : '#f59e0b'} />
                                            </div>
                                            {course.startDate && new Date(course.startDate) < new Date() ? (
                                                <span style={{ color: '#dc2626', fontWeight: 600 }}>หมดเขตลงทะเบียน</span>
                                            ) : (
                                                <span>ลงทะเบียนถึง: {formatDate(course.startDate)}</span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{
                                                width: 28, height: 28, borderRadius: 8,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: 'rgba(37,99,235,0.08)', flexShrink: 0,
                                            }}>
                                                <HiOutlineLocationMarker size={14} color="#2563eb" />
                                            </div>
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {course.location || 'ไม่ระบุ'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Registration progress */}
                                    <div style={{
                                        background: 'rgba(37,99,235,0.04)', borderRadius: 12, padding: '12px 14px',
                                        marginBottom: 18,
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                            <span style={{
                                                fontSize: 12, color: '#64748b', fontWeight: 500,
                                                display: 'flex', alignItems: 'center', gap: 4,
                                            }}>
                                                <HiOutlineUsers size={13} color="#2563eb" /> ผู้ลงทะเบียน
                                            </span>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>
                                                {registered}/{max} คน
                                            </span>
                                        </div>
                                        <div style={{
                                            height: 6, borderRadius: 10, background: '#e2e8f0', overflow: 'hidden',
                                        }}>
                                            <div style={{
                                                height: '100%', borderRadius: 10,
                                                width: `${progress}%`,
                                                background: progress > 80
                                                    ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                                                    : 'linear-gradient(90deg, #2563eb, #3b82f6, #60a5fa)',
                                                transition: 'width 1s ease-out',
                                                boxShadow: progress > 80
                                                    ? '0 0 8px rgba(245,158,11,0.4)'
                                                    : '0 0 8px rgba(37,99,235,0.3)',
                                            }} />
                                        </div>
                                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6, textAlign: 'right' }}>
                                            ว่างอีก <strong style={{ color: remaining > 5 ? '#10b981' : '#ef4444' }}>{remaining}</strong> ที่
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{
                                        display: 'flex', gap: 10, marginTop: 'auto',
                                    }}>
                                        <button onClick={() => setShowCourseDetail(course)} style={{
                                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            gap: 6, padding: '11px 0', borderRadius: 12,
                                            fontSize: 14, fontWeight: 600,
                                            border: '2px solid #2563eb', color: '#2563eb',
                                            background: '#fff',
                                            cursor: 'pointer', transition: 'all 0.3s',
                                        }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.background = 'rgba(37,99,235,0.06)';
                                                e.currentTarget.style.transform = 'translateY(-1px)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.background = '#fff';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            รายละเอียด
                                        </button>
                                        {course.status === 'open' && (!user || user.role === 'user') && !(course.startDate && new Date(course.startDate) < new Date()) && (
                                            <button onClick={() => handleRegister(course.id)} style={{
                                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                gap: 6, padding: '11px 0', borderRadius: 12,
                                                fontSize: 14, fontWeight: 700, color: '#fff',
                                                background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                                                border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                                                boxShadow: '0 4px 15px rgba(22,163,74,0.25)',
                                            }}
                                                onMouseEnter={e => {
                                                    e.target.style.boxShadow = '0 6px 25px rgba(22,163,74,0.4)';
                                                    e.target.style.transform = 'translateY(-1px)';
                                                }}
                                                onMouseLeave={e => {
                                                    e.target.style.boxShadow = '0 4px 15px rgba(22,163,74,0.25)';
                                                    e.target.style.transform = 'translateY(0)';
                                                }}
                                            >
                                                ลงทะเบียน
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div style={{
                        textAlign: 'center', padding: '80px 20px',
                        background: 'rgba(255,255,255,0.8)', borderRadius: 24,
                        backdropFilter: 'blur(10px)', border: '1px solid rgba(0,0,0,0.04)',
                    }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: 20, margin: '0 auto 16px',
                            background: 'rgba(37,99,235,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <HiOutlineAcademicCap size={40} color="#94a3b8" />
                        </div>
                        <p style={{ fontSize: 16, fontWeight: 600, color: '#64748b' }}>ไม่พบหลักสูตร</p>
                        <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>ลองเปลี่ยนหมวดหมู่หรือคำค้นหาใหม่</p>
                    </div>
                )}
            </div>

            {showCourseDetail && (
                <CourseDetailModal
                    course={showCourseDetail}
                    user={user}
                    onClose={() => setShowCourseDetail(null)}
                    onRegister={() => {
                        if (!user) { setShowCourseDetail(null); navigate('/login'); }
                        else {
                            setShowCourseDetail(null);
                            handleRegister(showCourseDetail.id);
                        }
                    }}
                />
            )}

            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
            `}</style>
        </div>
    );
}
