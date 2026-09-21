import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineAcademicCap, HiOutlineSearch, HiOutlineClock,
    HiOutlineLocationMarker, HiOutlineUsers, HiOutlineCalendar,
    HiOutlineClipboardList, HiOutlineChevronRight, HiOutlineDocumentText,
    HiOutlineUserGroup
} from 'react-icons/hi';

const CATEGORY_COLORS = {
    'คอมพิวเตอร์': '#c0392b',
    'การพัฒนาเว็บ': '#2980b9',
    'วิเคราะห์ข้อมูล': '#8e44ad',
    'การศึกษา': '#27ae60',
};

function getCategoryColor(category) {
    return CATEGORY_COLORS[category] || '#2563eb';
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export default function CourseSection({ courses, loading, scrollY, user, setShowCourseDetail, setShowCourseReg }) {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, categoryFilter]);

    const categories = [...new Set(courses.map(c => c.category))];
    const filteredCourses = courses.filter(c => {
        const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
        const matchCat = !categoryFilter || c.category === categoryFilter;
        return matchSearch && matchCat;
    }).sort((a, b) => {
        const nowTime = new Date().setHours(0, 0, 0, 0);
        const dateA = a.startDate ? new Date(a.startDate).getTime() : Infinity;
        const dateB = b.startDate ? new Date(b.startDate).getTime() : Infinity;
        
        const isAUpcoming = dateA >= nowTime;
        const isBUpcoming = dateB >= nowTime;
        
        if (isAUpcoming && !isBUpcoming) return -1;
        if (!isAUpcoming && isBUpcoming) return 1;
        
        return dateA - dateB;
    });

    const coursesPerPage = 6;
    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
    const currentCourses = filteredCourses.slice((currentPage - 1) * coursesPerPage, currentPage * coursesPerPage);

    return (
        <section id="courses" style={{
            position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(37,99,235,0.03) 1px, transparent 0)',
            backgroundSize: '24px 24px',
            padding: '100px 24px 120px',
        }}>
            {/* Subtle soft blur blobs */}
            <div style={{
                position: 'absolute', top: '10%', left: '10%', width: 'min(400px, 50vw)', height: 'min(400px, 50vw)',
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.04) 0%, transparent 70%)',
                filter: 'blur(50px)', pointerEvents: 'none', zIndex: 1
            }} />

            {/* Large Background Decorative Icons */}
            <div style={{ position: 'absolute', top: '15%', left: '5%', opacity: 0.03, color: '#2563eb', transform: `translateY(${scrollY * 0.1}px)`, pointerEvents: 'none' }}>
                <HiOutlineAcademicCap size={350} />
            </div>
            <div style={{ position: 'absolute', bottom: '10%', right: '8%', opacity: 0.02, color: '#2563eb', transform: `translateY(${scrollY * -0.05}px)`, pointerEvents: 'none' }}>
                <HiOutlineClipboardList size={400} />
            </div>
            <div style={{ position: 'absolute', top: '40%', right: '15%', opacity: 0.02, color: '#2563eb', pointerEvents: 'none' }}>
                <HiOutlineDocumentText size={250} />
            </div>

            <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 2 }}>
                {/* Section Header */}
                <div style={{ textAlign: 'left', marginBottom: 32 }}>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '6px 18px', borderRadius: 50,
                        fontSize: 12, fontWeight: 600, color: '#2563eb',
                        background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.12)',
                        marginBottom: 16, letterSpacing: 0.5,
                    }}>
                        <HiOutlineAcademicCap size={14} />
                        TRAINING COURSES
                    </span>
                    <h2 style={{
                        fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 800, marginBottom: 12, lineHeight: 1.3,
                        background: 'linear-gradient(135deg, #1e293b 30%, #2563eb 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        หลักสูตรการอบรม
                    </h2>
                    <p style={{ fontSize: 15, color: '#64748b', maxWidth: 500, lineHeight: 1.7 }}>
                        เลือกหลักสูตรที่สนใจและลงทะเบียนเพื่อเข้าร่วมการอบรมกับเรา
                    </p>
                </div>
                {/* Search & Categories */}
                <div style={{
                    display: 'flex', gap: 16, marginBottom: 40,
                    justifyContent: 'flex-start', flexWrap: 'wrap', alignItems: 'center'
                }}>
                    {/* Search Bar */}
                    <div style={{
                        display: 'flex', alignItems: 'center', flex: '1 1 400px', maxWidth: 500,
                        background: '#fff', borderRadius: 16, overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)',
                    }}>
                        <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center' }}>
                            <HiOutlineSearch size={20} color="#94a3b8" />
                        </div>
                        <input
                            type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="ค้นหาหลักสูตรหรือชื่อการอบรม..."
                            style={{
                                flex: 1, border: 'none', outline: 'none', padding: '14px 0',
                                fontSize: 15, color: '#1e293b', background: 'transparent',
                            }}
                        />
                        <button type="button" style={{
                            padding: '10px 24px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff', border: 'none',
                            cursor: 'pointer', fontWeight: 700, fontSize: 14, margin: 6, borderRadius: 12,
                            boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                        }}>ค้นหา</button>
                    </div>
                    
                    {/* Category Pills */}
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', overflowX: 'auto', paddingBottom: 4 }}>
                    <button onClick={() => setCategoryFilter('')} style={{
                        padding: '10px 24px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                        borderRadius: 50, transition: 'all 0.3s', whiteSpace: 'nowrap',
                        background: !categoryFilter ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : 'rgba(255,255,255,0.9)',
                        color: !categoryFilter ? '#fff' : '#64748b',
                        boxShadow: !categoryFilter ? '0 4px 15px rgba(37,99,235,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
                        backdropFilter: 'blur(10px)',
                        border: !categoryFilter ? 'none' : '1px solid rgba(0,0,0,0.06)',
                    }}>✨ ทั้งหมด</button>
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setCategoryFilter(cat)} style={{
                            padding: '10px 24px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                            borderRadius: 50, transition: 'all 0.3s', whiteSpace: 'nowrap',
                            background: categoryFilter === cat ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : 'rgba(255,255,255,0.9)',
                            color: categoryFilter === cat ? '#fff' : '#64748b',
                            boxShadow: categoryFilter === cat ? '0 4px 15px rgba(37,99,235,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
                            backdropFilter: 'blur(10px)',
                            border: categoryFilter === cat ? 'none' : '1px solid rgba(0,0,0,0.06)',
                        }}>{cat}</button>
                    ))}
                    </div>
                </div>

                {/* Course Cards */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 80 }}>
                        <div style={{
                            width: 48, height: 48, border: '3px solid rgba(37,99,235,0.15)', borderTopColor: '#2563eb',
                            borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px',
                        }} />
                        <p style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500 }}>กำลังโหลดหลักสูตร...</p>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 28 }}>
                            {currentCourses.map((course, idx) => {
                                const registered = course.registeredCount || 0;
                                const max = course.maxParticipants || 30;
                                const remaining = max - registered;
                                const progress = Math.min((registered / max) * 100, 100);
                                const catColor = getCategoryColor(course.category);
                                
                                let targetAudiences = [];
                                try {
                                    targetAudiences = typeof course.targetAudience === 'string' ? JSON.parse(course.targetAudience) : (course.targetAudience || []);
                                } catch(e) {}
                                return (
                                    <div key={course.id} className="course-card-animate" style={{
                                    background: '#fff', borderRadius: 20, overflow: 'hidden',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '1px solid rgba(226, 232, 240, 0.8)', display: 'flex', flexDirection: 'column',
                                    animation: `fadeSlideUp 0.6s ease-out ${idx * 0.1}s both`,
                                    position: 'relative',
                                }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'translateY(-8px) scale(1.01)';
                                        e.currentTarget.style.boxShadow = `0 20px 50px ${catColor}20, 0 8px 20px rgba(0,0,0,0.08)`;
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
                                    }}
                                >
                                    {/* Course Image with gradient overlay */}
                                    <div style={{
                                        height: 180, position: 'relative', overflow: 'hidden',
                                        background: course.image ? '#f5f5f5' : `linear-gradient(135deg, ${catColor}15, ${catColor}30)`,
                                    }}>
                                        {course.image ? (
                                            <img src={course.image} alt={course.title} style={{
                                                width: '100%', height: '100%', objectFit: 'cover',
                                                transition: 'transform 0.5s ease',
                                            }} onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
                                                onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                                        ) : (
                                            <div style={{
                                                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: `linear-gradient(135deg, ${catColor}10, ${catColor}25)`,
                                            }}>
                                                <div style={{
                                                    width: 80, height: 80, borderRadius: 20,
                                                    background: `${catColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    animation: 'pulse 3s ease-in-out infinite',
                                                }}>
                                                    <HiOutlineAcademicCap size={40} color={catColor} style={{ opacity: 0.6 }} />
                                                </div>
                                            </div>
                                        )}
                                        {/* Bottom gradient overlay */}
                                        <div style={{
                                            position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)',
                                        }} />
                                        {/* Category badge */}
                                        <span style={{
                                            position: 'absolute', top: 14, left: 14, padding: '5px 14px',
                                            borderRadius: 50, fontSize: 11, fontWeight: 700, color: '#fff',
                                            background: `linear-gradient(135deg, ${catColor}, ${catColor}cc)`,
                                            boxShadow: `0 2px 10px ${catColor}40`,
                                            backdropFilter: 'blur(4px)',
                                            letterSpacing: 0.3,
                                        }}>{course.category}</span>
                                        {/* Status ribbon */}
                                        <span style={{
                                            position: 'absolute', top: 14, right: 14, padding: '5px 12px',
                                            borderRadius: 50, fontSize: 10, fontWeight: 700,
                                            background: remaining > 10 ? 'rgba(16,185,129,0.9)' : remaining > 0 ? 'rgba(245,158,11,0.9)' : 'rgba(239,68,68,0.9)',
                                            color: '#fff', backdropFilter: 'blur(4px)',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                        }}>
                                            {remaining > 10 ? '🟢 เปิดรับ' : remaining > 0 ? '🟡 ใกล้เต็ม' : '🔴 เต็มแล้ว'}
                                        </span>
                                    </div>

                                    {/* Course Info */}
                                    <div style={{ padding: '20px 22px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <h3 style={{
                                            fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 14, lineHeight: 1.5,
                                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                        }}>
                                            {course.title}
                                        </h3>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                                            {course.trainingDate && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{
                                                        width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        background: 'rgba(37,99,235,0.08)', flexShrink: 0,
                                                    }}>
                                                        <HiOutlineCalendar size={14} color="#2563eb" />
                                                    </div>
                                                    <span style={{ fontWeight: 600, color: '#1e293b' }}>อบรม: {course.trainingDate}</span>
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{
                                                    width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: (course.startDate && new Date(course.startDate) < new Date()) || remaining <= 0 ? 'rgba(220,38,38,0.08)' : 'rgba(245,158,11,0.08)', flexShrink: 0,
                                                }}>
                                                    <HiOutlineClock size={14} color={(course.startDate && new Date(course.startDate) < new Date()) || remaining <= 0 ? '#dc2626' : '#f59e0b'} />
                                                </div>
                                                {course.startDate && new Date(course.startDate) < new Date() ? (
                                                    <span style={{ color: '#dc2626', fontWeight: 600 }}>สิ้นสุดการลงทะเบียน</span>
                                                ) : remaining <= 0 ? (
                                                    <span style={{ color: '#dc2626', fontWeight: 600 }}>เต็มแล้ว</span>
                                                ) : (
                                                    <span>ลงทะเบียนถึง: {formatDate(course.startDate)}</span>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{
                                                    width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: 'rgba(37,99,235,0.08)', flexShrink: 0,
                                                }}>
                                                    <HiOutlineLocationMarker size={14} color="#2563eb" />
                                                </div>
                                                <span style={{
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                }}>{course.location || 'ไม่ระบุ'}</span>
                                            </div>
                                            
                                            {targetAudiences.length > 0 && (
                                                <div style={{ marginTop: 12, padding: '8px 10px', background: 'rgba(37,99,235,0.04)', borderRadius: 8, border: '1px solid rgba(37,99,235,0.1)' }}>
                                                    <div style={{ fontSize: 11, fontWeight: 600, color: '#1d4ed8', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <HiOutlineUserGroup size={14} /> กลุ่มเป้าหมาย:
                                                    </div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                                        {targetAudiences.map(tag => (
                                                            <span key={tag} style={{
                                                                padding: '2px 8px', borderRadius: 50,
                                                                fontSize: 10, fontWeight: 600, color: '#1d4ed8',
                                                                background: '#eff6ff', border: '1px solid #bfdbfe',
                                                            }}>{tag}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Registration progress */}
                                        <div style={{
                                            background: 'rgba(37,99,235,0.04)', borderRadius: 12, padding: '12px 14px',
                                            marginBottom: 18,
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
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
                                                    background: progress > 80 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #2563eb, #3b82f6, #60a5fa)',
                                                    transition: 'width 1s ease-out',
                                                    boxShadow: progress > 80 ? '0 0 8px rgba(245,158,11,0.4)' : '0 0 8px rgba(37,99,235,0.3)',
                                                }} />
                                            </div>
                                            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6, textAlign: 'right' }}>
                                                {remaining <= 0 ? (
                                                    <strong style={{ color: '#ef4444' }}>เต็มแล้ว</strong>
                                                ) : (
                                                    <>ว่างอีก <strong style={{ color: remaining > 5 ? '#10b981' : '#ef4444' }}>{remaining}</strong> ที่</>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                                            <button onClick={() => setShowCourseDetail(course)} style={{
                                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                gap: 6, padding: '11px 0', borderRadius: 12,
                                                fontSize: 14, fontWeight: 600,
                                                border: '2px solid #2563eb', color: '#2563eb',
                                                background: '#fff', cursor: 'pointer', transition: 'all 0.3s',
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
                                            {(!user || user.role === 'user') && !(course.startDate && new Date(course.startDate) < new Date()) && (
                                                <button onClick={() => {
                                                    if (!user) { navigate('/login'); }
                                                    else { setShowCourseReg(course); }
                                                }} style={{
                                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    gap: 6, padding: '11px 0', borderRadius: 12,
                                                    fontSize: 14, fontWeight: 700, color: '#fff',
                                                    background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                                                    border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                                                    boxShadow: '0 4px 15px rgba(22,163,74,0.25)',
                                                }}
                                                    onMouseEnter={e => {
                                                        e.currentTarget.style.boxShadow = '0 6px 25px rgba(22,163,74,0.4)';
                                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                                    }}
                                                    onMouseLeave={e => {
                                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(22,163,74,0.25)';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                    }}
                                                >
                                                    <HiOutlineClipboardList size={16} />
                                                    ลงทะเบียน
                                                    <HiOutlineChevronRight size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40, gap: 8 }}>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    style={{
                                        width: 40, height: 40, borderRadius: '50%',
                                        border: 'none', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 14, fontWeight: 600, transition: 'all 0.3s',
                                        background: currentPage === page ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : '#fff',
                                        color: currentPage === page ? '#fff' : '#64748b',
                                        boxShadow: currentPage === page ? '0 4px 12px rgba(37,99,235,0.3)' : '0 2px 6px rgba(0,0,0,0.05)',
                                    }}
                                    onMouseEnter={e => {
                                        if (currentPage !== page) e.currentTarget.style.background = '#f8fafc';
                                    }}
                                    onMouseLeave={e => {
                                        if (currentPage !== page) e.currentTarget.style.background = '#fff';
                                    }}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    )}
                    </>
                )}

                {!loading && filteredCourses.length === 0 && (
                    <div style={{
                        textAlign: 'center', padding: '60px 20px',
                        background: 'rgba(255,255,255,0.6)', borderRadius: 20,
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

                {/* View all CTA */}
                {!loading && filteredCourses.length > 0 && (
                    <div style={{ textAlign: 'center', marginTop: 48 }}>
                        <button onClick={() => { setCategoryFilter(''); setSearch(''); }} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '14px 36px', borderRadius: 50,
                            fontSize: 15, fontWeight: 700, letterSpacing: 0.3,
                            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                            color: '#fff', border: 'none', cursor: 'pointer',
                            boxShadow: '0 6px 25px rgba(37,99,235,0.3)',
                            transition: 'all 0.3s',
                        }}
                            onMouseEnter={e => {
                                e.target.style.transform = 'translateY(-3px)';
                                e.target.style.boxShadow = '0 10px 35px rgba(37,99,235,0.4)';
                            }}
                            onMouseLeave={e => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 6px 25px rgba(37,99,235,0.3)';
                            }}
                        >
                            ดูหลักสูตรทั้งหมด
                            <HiOutlineChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
