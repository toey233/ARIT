// นำเข้าไลบรารีที่จำเป็นสำหรับหน้าหลักของเว็บไซต์ (Landing Page)
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CourseRegModal from '../components/CourseRegModal';
import CourseDetailModal from '../components/CourseDetailModal';
import NewsDetailModal from '../components/NewsDetailModal';
import EvaluationModal from '../components/EvaluationModal';
import RegistrantsModal from '../components/RegistrantsModal';
import ProfileModal from '../components/ProfileModal';
import NotificationDropdown from '../components/NotificationDropdown';
import {
    HiOutlineAcademicCap, HiOutlineSearch, HiOutlineClock,
    HiOutlineLocationMarker, HiOutlineUsers, HiOutlineCalendar,
    HiOutlineBell, HiOutlineDocumentText, HiOutlineMenu, HiOutlineX,
    HiOutlineLogin, HiOutlineUserAdd, HiOutlineChevronRight, HiOutlineLogout,
    HiOutlineClipboardList, HiOutlineUserCircle, HiOutlineExclamation
} from 'react-icons/hi';

const NAV_LINKS = [
    { label: 'หน้าหลัก', href: '#hero' },
    { label: 'หลักสูตรอบรม', href: '#courses' },
    { label: 'ข่าวสาร', href: '#news' },
    { label: 'FAQ', href: '#features' },
    { label: 'ติดต่อเรา', href: '#footer' },
];

const USER_NAV_LINKS = [
    { label: 'หน้าหลัก', href: '#hero' },
    { label: 'หลักสูตรอบรม', href: '#courses' },
    { label: 'การลงทะเบียนของฉัน', path: '/my-registrations' },
    { label: 'ประกาศนียบัตร', path: '/certificates' },
    { label: 'ข่าวสาร', href: '#news' },
];

const CATEGORY_COLORS = {
    'คอมพิวเตอร์': '#c0392b',
    'การพัฒนาเว็บ': '#2980b9',
    'วิเคราะห์ข้อมูล': '#8e44ad',
    'การศึกษา': '#27ae60',
};

function getCategoryColor(category) {
    return CATEGORY_COLORS[category] || '#2563eb';
}

// คอมโพเนนต์หน้าแรก (Landing Page) เป็นหน้าต่างบานแรกของเว็บเมื่อคนเข้ามา
export default function HomePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [news, setNews] = useState([]);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [scrolled, setScrolled] = useState(false);
    const [showCourseReg, setShowCourseReg] = useState(null);
    const [showCourseDetail, setShowCourseDetail] = useState(null);
    const [showNewsDetail, setShowNewsDetail] = useState(null);
    const [showRegistrants, setShowRegistrants] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [selectedCert, setSelectedCert] = useState(null);
    const [showEvaluation, setShowEvaluation] = useState(null);
    const [evalStatus, setEvalStatus] = useState({});
    const [newsHovered, setNewsHovered] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const newsScrollRef = useRef(null);

    const activeNavLinks = (user && user.role === 'user') ? USER_NAV_LINKS : NAV_LINKS;

    // ฟังก์ชันสำหรับกดเมนูแล้วเลื่อนไปยังส่วนต่างๆ ของหน้า
    const handleNavClick = (link) => {
        setMobileMenuOpen(false);
        if (link.path) {
            navigate(link.path);
        } else if (link.href) {
            const id = link.href.replace('#', '');
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        setShowLogoutConfirm(false);
        logout();
        navigate('/');
    };

    // ตรวจจับการเลื่อนเมาส์ (Scroll) เพื่อเปลี่ยนสไตล์เมนูบาร์
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
            setScrollY(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        Promise.all([
            api.get('/courses').catch(() => ({ data: [] })),
            api.get('/news').catch(() => ({ data: [] })),
        ]).then(([coursesRes, newsRes]) => {
            setCourses(coursesRes.data);
            setNews(newsRes.data.slice(0, 3));
        }).finally(() => setLoading(false));
    }, []);

    // Auto-scroll news (infinite loop)
    useEffect(() => {
        const container = newsScrollRef.current;
        if (!container || newsHovered || news.length === 0) return;
        const timer = setInterval(() => {
            // Since items are duplicated [...news, ...news], halfway = one full set
            const halfScroll = container.scrollWidth / 2;
            if (container.scrollLeft >= halfScroll) {
                // Instantly jump back to start (seamless because content is duplicated)
                container.scrollLeft = 0;
            } else {
                container.scrollLeft += 1;
            }
        }, 20);
        return () => clearInterval(timer);
    }, [newsHovered, news]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, categoryFilter]);

    // Fetch user-specific data when logged in
    useEffect(() => {
        if (user && user.role === 'user') {
            api.get('/registrations').then(res => {
                setRegistrations(res.data);
                // Check evaluation status for approved registrations
                res.data.filter(r => r.status === 'approved').forEach(reg => {
                    api.get(`/evaluations/check/${reg.courseId}`).then(evalRes => {
                        setEvalStatus(prev => ({ ...prev, [reg.courseId]: evalRes.data.evaluated }));
                    }).catch(() => { });
                });
            }).catch(() => { });
            api.get('/certificates/my').then(res => setCertificates(res.data)).catch(() => { });
        }
    }, [user]);

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

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            const el = document.getElementById('courses');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const scrollTo = (href) => {
        setMobileMenuOpen(false);
        const id = href.replace('#', '');
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div style={{ position: 'relative', fontFamily: "'Noto Sans Thai', 'Inter', system-ui, sans-serif", color: '#333', background: 'transparent' }}>
            {/* Parallax Background Elements */}
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                zIndex: -1, overflow: 'hidden', pointerEvents: 'none',
                background: '#fff',
            }}>
                <div style={{
                    position: 'absolute', top: '15%', left: '5%', width: 'min(60vw, 800px)', height: 'min(60vw, 800px)',
                    borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
                    filter: 'blur(70px)',
                    transform: `translateY(${scrollY * 0.45}px)`,
                    transition: 'transform 0.15s ease-out',
                }} />
                <div style={{
                    position: 'absolute', top: '45%', right: '-10%', width: 'min(65vw, 900px)', height: 'min(65vw, 900px)',
                    borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)',
                    filter: 'blur(90px)',
                    transform: `translateY(${scrollY * -0.35}px)`,
                    transition: 'transform 0.15s ease-out',
                }} />
                <div style={{
                    position: 'absolute', top: '80%', left: '10%', width: 'min(55vw, 700px)', height: 'min(55vw, 700px)',
                    borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    transform: `translateY(${scrollY * 0.3}px)`,
                    transition: 'transform 0.15s ease-out',
                }} />
                
                {/* Sparkles / Particles */}
                {[...Array(8)].map((_, i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        width: 4, height: 4, background: '#fff',
                        borderRadius: '50%', boxShadow: '0 0 10px #fff',
                        opacity: 0.3,
                        transform: `translateY(${scrollY * (0.1 + Math.random() * 0.3)}px)`,
                        animation: `pulse ${2 + Math.random() * 3}s infinite`,
                    }} />
                ))}
                
                {/* Additional subtle patterns */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `radial-gradient(circle at 2px 2px, rgba(37,99,235,0.03) 1px, transparent 0)`,
                    backgroundSize: '40px 40px',
                    opacity: 0.5,
                }} />
            </div>

            {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} />}
            {/* ========== NAVBAR ========== */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
                background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(12px)',
                boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.1)' : '0 1px 8px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', height: 44 }}>
                            <img 
                                src="/logo.png" 
                                alt="Logo" 
                                style={{ height: '100%', width: 'auto', objectFit: 'contain', display: 'block' }}
                                onError={(e) => { 
                                    e.target.style.display='none'; 
                                    e.target.nextSibling.style.display='flex'; 
                                }} 
                            />
                            <div style={{ 
                                display: 'none', width: 44, height: 44, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                                alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontWeight: 'bold', fontSize: 18, boxShadow: '0 2px 8px rgba(37,99,235,0.3)'
                            }}>A</div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 16, color: '#2563eb', lineHeight: 1.2 }}>ระบบบริหารการจัดการอบรม</div>
                            <div style={{ fontSize: 11, color: '#999', letterSpacing: 0.5 }}>ARIT Management Training System</div>
                        </div>
                    </div>

                    {/* Desktop Nav Links */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="home-nav-desktop">
                        {activeNavLinks.map((link, i) => (
                            <button key={link.label} onClick={() => handleNavClick(link)} style={{
                                background: 'none', border: 'none', padding: '8px 16px', cursor: 'pointer',
                                fontSize: 15, fontWeight: 500, color: '#555', borderRadius: 8,
                                transition: 'all 0.2s',
                            }}
                                onMouseEnter={e => { e.target.style.color = '#2563eb'; e.target.style.background = 'rgba(37,99,235,0.06)'; }}
                                onMouseLeave={e => { e.target.style.color = '#555'; e.target.style.background = 'none'; }}
                            >{link.label}</button>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="home-nav-desktop">
                        {user ? (
                            <>
                                <NotificationDropdown />
                                <button onClick={() => setShowProfile(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'rgba(37,99,235,0.06)', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.12)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,99,235,0.06)'}>
                                    <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <img 
                                            src={user?.profilePicture || "/default-avatar.png"} 
                                            alt="Profile" 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                            onError={(e) => { 
                                                e.target.style.display='none'; 
                                                e.target.nextSibling.style.display='flex'; 
                                            }} 
                                        />
                                        <div style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                            <HiOutlineUserCircle size={24} color="#2563eb" />
                                        </div>
                                    </div>
                                    <span style={{ fontSize: 14, color: '#555', fontWeight: 500 }}>{user.firstName}</span>
                                </button>
                                <button onClick={handleLogout} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                                    border: '1.5px solid #c0392b', color: '#c0392b', background: 'transparent',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                }}>
                                    <HiOutlineLogout size={16} /> ออกจากระบบ
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => navigate('/register')} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                                    border: '1.5px solid #2563eb', color: '#2563eb', background: 'transparent',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                }}>
                                    <HiOutlineUserAdd size={16} /> สมัครสมาชิก
                                </button>
                                <button onClick={() => navigate('/login')} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                                    background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff',
                                    cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                                    border: 'none',
                                }}>
                                    <HiOutlineLogin size={16} /> เข้าสู่ระบบ
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="home-nav-mobile-btn" style={{
                        display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', padding: 4,
                    }}>
                        {mobileMenuOpen ? <HiOutlineX size={28} /> : <HiOutlineMenu size={28} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div style={{
                        background: '#fff', borderTop: '1px solid #eee', padding: '16px 24px',
                        display: 'flex', flexDirection: 'column', gap: 8,
                    }} className="home-nav-mobile-menu">
                        {activeNavLinks.map(link => (
                            <button key={link.label} onClick={() => handleNavClick(link)} style={{
                                background: 'none', border: 'none', padding: '10px 0', cursor: 'pointer',
                                fontSize: 15, fontWeight: 500, color: '#555', textAlign: 'left',
                            }}>{link.label}</button>
                        ))}
                        <div style={{ borderTop: '1px solid #eee', paddingTop: 12, display: 'flex', gap: 10, marginTop: 4 }}>
                            {user ? (
                                <>
                                    <button onClick={() => { setMobileMenuOpen(false); setShowProfile(true); }} style={{
                                        flex: 1, textAlign: 'center', padding: '10px 16px', borderRadius: 8,
                                        background: 'rgba(37,99,235,0.1)', color: '#2563eb', border: 'none',
                                        cursor: 'pointer', fontWeight: 600, fontSize: 14,
                                    }}>ข้อมูลส่วนตัว</button>
                                    <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} style={{
                                        flex: 1, textAlign: 'center', padding: '10px 16px', borderRadius: 8,
                                        border: '1.5px solid #c0392b', color: '#c0392b', background: 'transparent',
                                        cursor: 'pointer', fontWeight: 500, fontSize: 14,
                                    }}>ออกจากระบบ</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => { setMobileMenuOpen(false); navigate('/register'); }} style={{
                                        flex: 1, textAlign: 'center', padding: '10px 16px', borderRadius: 8,
                                        border: '1.5px solid #2563eb', color: '#2563eb', background: 'transparent', cursor: 'pointer', fontWeight: 500, fontSize: 14,
                                    }}>สมัครสมาชิก</button>
                                    <button onClick={() => { setMobileMenuOpen(false); navigate('/login'); }} style={{
                                        flex: 1, textAlign: 'center', padding: '10px 16px', borderRadius: 8,
                                        background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
                                    }}>เข้าสู่ระบบ</button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* ========== HERO SECTION ========== */}
            <section id="hero" style={{
                position: 'relative', minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundImage: 'url(/hero-bg.jpg)',
                backgroundSize: 'cover', backgroundPosition: 'center',
                overflow: 'hidden', paddingTop: 70,
            }}>
                {/* Unified Dark Overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(135deg, rgba(15,23,42,0.88) 0%, rgba(30,58,138,0.75) 50%, rgba(15,23,42,0.88) 100%)',
                    backdropFilter: 'blur(2px)',
                }} />
                
                {/* Floating Decoration Icons */}
                <div style={{
                    position: 'absolute', top: '15%', right: '10%', opacity: 0.3, color: '#fff',
                    transform: `translateY(${scrollY * 0.15}px) rotate(${scrollY * 0.05}deg)`,
                    animation: 'float 8s ease-in-out infinite'
                }}>
                    <HiOutlineAcademicCap size={150} />
                </div>
                <div style={{
                    position: 'absolute', bottom: '20%', left: '8%', opacity: 0.2, color: '#fff',
                    transform: `translateY(${scrollY * -0.1}px) rotate(${scrollY * -0.03}deg)`,
                    animation: 'float 10s ease-in-out infinite reverse'
                }}>
                    <HiOutlineDocumentText size={120} />
                </div>
                <div style={{
                    position: 'absolute', top: '25%', left: '12%', opacity: 0.15, color: '#fff',
                    transform: `translateY(${scrollY * 0.2}px)`,
                    animation: 'float 12s ease-in-out infinite 2s'
                }}>
                    <HiOutlineClipboardList size={100} />
                </div>
                {/* Animated background pattern */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `
                        radial-gradient(circle at 15% 85%, rgba(59,130,246,0.25) 0%, transparent 50%),
                        radial-gradient(circle at 85% 15%, rgba(99,102,241,0.2) 0%, transparent 50%),
                        radial-gradient(circle at 50% 50%, rgba(37,99,235,0.15) 0%, transparent 60%)
                    `,
                }} />

                {/* Floating university-themed SVGs */}
                <svg style={{ position: 'absolute', top: '10%', right: '8%', opacity: 0.12, animation: 'float 6s ease-in-out infinite' }} width="120" height="120" viewBox="0 0 24 24" fill="white">
                    <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                </svg>
                <svg style={{ position: 'absolute', bottom: '15%', left: '6%', opacity: 0.1, animation: 'float 8s ease-in-out infinite reverse' }} width="90" height="90" viewBox="0 0 24 24" fill="white">
                    <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
                </svg>
                <svg style={{ position: 'absolute', top: '25%', left: '15%', opacity: 0.08, animation: 'float 7s ease-in-out infinite 1s' }} width="70" height="70" viewBox="0 0 24 24" fill="white">
                    <path d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.3 3-3.4 3-5.7 0-3.9-3.1-7-7-7z" />
                </svg>
                <svg style={{ position: 'absolute', bottom: '30%', right: '12%', opacity: 0.07, animation: 'float 9s ease-in-out infinite 2s' }} width="80" height="80" viewBox="0 0 24 24" fill="white">
                    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
                </svg>

                {/* Decorative circles */}
                <div style={{ position: 'absolute', top: '15%', right: '8%', width: 250, height: 250, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', animation: 'pulse 4s ease-in-out infinite' }} />
                <div style={{ position: 'absolute', bottom: '20%', left: '5%', width: 180, height: 180, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', animation: 'pulse 5s ease-in-out infinite 1s' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', width: 400, height: 400, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.03)', transform: 'translate(-50%, -50%)' }} />

                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 900, padding: '60px 24px' }}>
                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 20px 6px 8px',
                        borderRadius: 50, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.15)', marginBottom: 24,
                        fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 500,
                    }}>
                        <div style={{
                            width: 24, height: 24, borderRadius: '50%', background: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2
                        }}>
                            <img src="/logo.png" alt="University Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        สำนักวิทยบริการและเทคโนโลยีสารสนเทศ
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, color: '#fff',
                        marginBottom: 16, lineHeight: 1.3,
                        textShadow: '0 4px 30px rgba(0,0,0,0.3)',
                    }}>
                        ศูนย์การเรียนรู้และฝึกอบรม<br />
                        <span style={{ background: 'linear-gradient(90deg, #93c5fd, #60a5fa, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            มหาวิทยาลัยราชภัฏมหาสารคาม
                        </span>
                    </h1>
                    <p style={{
                        fontSize: 'clamp(15px, 2.2vw, 18px)', color: 'rgba(255,255,255,0.75)',
                        marginBottom: 40, lineHeight: 1.7, maxWidth: 650, margin: '0 auto 40px',
                    }}>
                        พัฒนาทักษะด้านดิจิทัลและเทคโนโลยี ลงทะเบียนเรียนรู้ผ่านระบบออนไลน์
                        พร้อมรับประกาศนียบัตรอิเล็กทรอนิกส์ได้ทันที
                    </p>



                </div>

                {/* Bottom wave */}
                <svg style={{ position: 'absolute', bottom: -2, left: 0, width: '100%' }} viewBox="0 0 1440 100" preserveAspectRatio="none">
                    <path fill="#fff" d="M0,60 C360,100 720,20 1080,60 C1260,80 1380,70 1440,60 L1440,100 L0,100 Z" />
                </svg>
            </section>

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
                                                        width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        background: 'rgba(37,99,235,0.08)', flexShrink: 0,
                                                    }}>
                                                        <HiOutlineLocationMarker size={14} color="#2563eb" />
                                                    </div>
                                                    <span style={{
                                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                    }}>{course.location || 'ไม่ระบุ'}</span>
                                                </div>
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
                                                    ว่างอีก <strong style={{ color: remaining > 5 ? '#10b981' : '#ef4444' }}>{remaining}</strong> ที่
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

            {/* Removed My Registrations Section as it is now a separate page */}

            {/* Removed Certificates Section as it is now a separate page */}
            <section id="news" style={{
                position: 'relative', overflow: 'hidden',
                background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(37,99,235,0.03) 1px, transparent 0)',
                backgroundSize: '24px 24px',
                padding: '80px 0 100px',
            }}>
                {/* Subtle soft blur blobs */}
                <div style={{
                    position: 'absolute', top: '20%', right: '10%', width: 'min(400px, 50vw)', height: 'min(400px, 50vw)',
                    borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.04) 0%, transparent 70%)',
                    filter: 'blur(50px)', pointerEvents: 'none', zIndex: 1
                }} />

                {/* Decorative elements */}
                <div style={{
                    position: 'absolute', top: -100, left: -100, width: 300, height: 300,
                    borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
                    animation: 'pulse 7s ease-in-out infinite', pointerEvents: 'none'
                }} />
                <div style={{
                    position: 'absolute', bottom: -80, right: -80, width: 280, height: 280,
                    borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)',
                    animation: 'pulse 9s ease-in-out infinite 3s', pointerEvents: 'none'
                }} />
                <svg style={{ position: 'absolute', top: '12%', right: '6%', opacity: 0.04, animation: 'float 8s ease-in-out infinite', pointerEvents: 'none' }} width="55" height="55" viewBox="0 0 24 24" fill="#2563eb">
                    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                </svg>

                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 2 }}>
                    {/* Section Header */}
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '6px 18px', borderRadius: 50,
                            fontSize: 12, fontWeight: 600, color: '#2563eb',
                            background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.12)',
                            marginBottom: 16, letterSpacing: 0.5,
                        }}>
                            <HiOutlineBell size={14} />
                            NEWS & ANNOUNCEMENTS
                        </span>
                        <h2 style={{
                            fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 800, marginBottom: 12, lineHeight: 1.3,
                            background: 'linear-gradient(135deg, #1e293b 30%, #2563eb 100%)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            ข่าวสารและประกาศ
                        </h2>
                        <p style={{ fontSize: 15, color: '#64748b', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
                            ติดตามข่าวสารและกำหนดการอบรมล่าสุดจากสำนักวิทยบริการฯ
                        </p>
                    </div>
                </div>

                {/* Auto-scrolling news marquee */}
                <div
                    ref={newsScrollRef}
                    onMouseEnter={() => setNewsHovered(true)}
                    onMouseLeave={() => setNewsHovered(false)}
                    style={{
                        display: 'flex', gap: 24, overflowX: 'auto', padding: '8px 24px 20px',
                        scrollbarWidth: 'none', msOverflowStyle: 'none',
                        scrollBehavior: 'smooth', cursor: 'grab',
                    }}
                >
                    {/* Duplicate news for infinite-feel scroll */}
                    {[...news, ...news].map((item, idx) => {
                        const catColors = {
                            'ประชาสัมพันธ์': '#2563eb',
                            'กำหนดการ': '#059669',
                            'ประกาศ': '#ea580c',
                            'ผลการอบรม': '#8b5cf6',
                        };
                        const accentColor = catColors[item.category] || '#6366f1';
                        return (
                            <div key={`${item.id}-${idx}`} onClick={() => setShowNewsDetail(item)} style={{
                                minWidth: 340, maxWidth: 340, flexShrink: 0,
                                background: '#fff', borderRadius: 20, padding: '28px 24px',
                                boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
                                border: '1px solid rgba(226, 232, 240, 0.8)',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer',
                                position: 'relative', overflow: 'hidden',
                            }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                                    e.currentTarget.style.boxShadow = `0 16px 40px ${accentColor}15, 0 6px 16px rgba(0,0,0,0.08)`;
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                    e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)';
                                }}
                            >
                                {/* Accent top line */}
                                <div style={{
                                    position: 'absolute', top: 0, left: 24, right: 24, height: 3,
                                    background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80)`,
                                    borderRadius: '0 0 4px 4px',
                                }} />

                                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: 18 }}>
                                    <div style={{
                                        width: 44, height: 44, borderRadius: 14,
                                        background: `${accentColor}10`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: `1px solid ${accentColor}15`,
                                    }}>
                                        <HiOutlineBell size={20} color={accentColor} />
                                    </div>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '4px 10px', borderRadius: 50,
                                        background: 'rgba(0,0,0,0.03)', fontSize: 11, color: '#94a3b8', fontWeight: 500,
                                    }}>
                                        <HiOutlineClock size={12} />
                                        {formatDate(item.createdAt)}
                                    </div>
                                </div>

                                <h3 style={{
                                    fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 10, lineHeight: 1.5,
                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                }}>
                                    {item.title}
                                </h3>

                                {item.image && (
                                    <div style={{ marginBottom: 12, borderRadius: 12, overflow: 'hidden', maxHeight: 160 }}>
                                        <img src={item.image} alt={item.title} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                                    </div>
                                )}

                                <p style={{
                                    fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 16,
                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                }}>
                                    {item.content}
                                </p>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                        padding: '5px 14px', borderRadius: 50,
                                        fontSize: 11, fontWeight: 600, color: accentColor,
                                        background: `${accentColor}08`, border: `1px solid ${accentColor}15`,
                                    }}>
                                        <HiOutlineDocumentText size={12} />
                                        {item.category}
                                    </span>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 4,
                                        fontSize: 13, color: accentColor, fontWeight: 600,
                                        transition: 'gap 0.3s',
                                    }}>
                                        <span>อ่านเพิ่มเติม</span>
                                        <HiOutlineChevronRight size={14} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Scroll hint / fade edges */}
                <div style={{
                    position: 'absolute', top: 0, bottom: 0, left: 0, width: 60,
                    background: 'linear-gradient(to right, rgba(240,244,255,0.9), transparent)',
                    pointerEvents: 'none', zIndex: 3,
                }} />
                <div style={{
                    position: 'absolute', top: 0, bottom: 0, right: 0, width: 60,
                    background: 'linear-gradient(to left, rgba(240,244,255,0.9), transparent)',
                    pointerEvents: 'none', zIndex: 3,
                }} />
            </section>

            {/* ========== FEATURES / WHY US SECTION ========== */}
            <section id="features" style={{
                position: 'relative', overflow: 'hidden',
                background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(37,99,235,0.03) 1px, transparent 0)',
                backgroundSize: '24px 24px',
                padding: '80px 24px'
            }}>
                {/* Subtle soft blur blobs */}
                <div style={{
                    position: 'absolute', bottom: '10%', left: '5%', width: 'min(400px, 50vw)', height: 'min(400px, 50vw)',
                    borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.03) 0%, transparent 70%)',
                    filter: 'blur(50px)', pointerEvents: 'none', zIndex: 1
                }} />

                <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 2 }}>
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '6px 18px', borderRadius: 50,
                            fontSize: 12, fontWeight: 600, color: '#2563eb',
                            background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.12)',
                            marginBottom: 16, letterSpacing: 0.5,
                        }}>
                            <HiOutlineAcademicCap size={14} />
                            SERVICES & FEATURES
                        </span>
                        <h2 style={{
                            fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 800, marginBottom: 12, lineHeight: 1.3,
                            background: 'linear-gradient(135deg, #1e293b 30%, #2563eb 100%)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            บริการของสำนักวิทยบริการฯ
                        </h2>
                        <p style={{ fontSize: 15, color: '#64748b', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
                            ศูนย์กลางการเรียนรู้ดิจิทัลและฝึกอบรมทักษะเทคโนโลยีสารสนเทศ
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 24 }}>
                        {[
                            { icon: '📖', title: 'ห้องสมุดดิจิทัล', desc: 'เข้าถึงทรัพยากรการเรียนรู้ออนไลน์ ฐานข้อมูลวิชาการ และ e-Books ได้ตลอด 24 ชั่วโมง', color: '#8b5cf6' },
                            { icon: '🎓', title: 'หลักสูตรฝึกอบรม', desc: 'อบรมทักษะคอมพิวเตอร์ เว็บไซต์ AI และเทคโนโลยีล้ำสมัย พร้อมวิทยากรผู้เชี่ยวชาญ', color: '#2563eb' },
                            { icon: '📜', title: 'ประกาศนียบัตร e-Certificate', desc: 'รับประกาศนียบัตรอิเล็กทรอนิกส์ทันทีหลังจบหลักสูตร พร้อมยืนยันตัวตน', color: '#059669' },
                            { icon: '💡', title: 'พัฒนาทักษะดิจิทัล', desc: 'เสริมสร้างความรู้ด้าน Digital Literacy สำหรับนักศึกษาและบุคลากรทุกระดับ', color: '#ea580c' },
                        ].map((feature, i) => (
                            <div key={i} style={{
                                background: '#fff', borderRadius: 20, padding: '36px 28px', textAlign: 'center',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid rgba(226, 232, 240, 0.8)',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', overflow: 'hidden',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = `0 20px 40px ${feature.color}18`; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)'; }}
                            >
                                <div style={{
                                    width: 72, height: 72, borderRadius: 20, margin: '0 auto 20px',
                                    background: `${feature.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 36,
                                }}>
                                    {feature.icon}
                                </div>
                                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1e293b', marginBottom: 10 }}>{feature.title}</h3>
                                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== FOOTER ========== */}
            <footer id="footer" style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)', color: '#fff', padding: '60px 24px 24px' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 40, marginBottom: 40 }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 18, fontWeight: 'bold',
                                }}>A</div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 14 }}>ARIT Training</div>
                                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Management System</div>
                                </div>
                            </div>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8 }}>
                                สำนักวิทยบริการและเทคโนโลยีสารสนเทศ<br />
                                มหาวิทยาลัยราชภัฏมหาสารคาม<br />
                                ศูนย์กลางการเรียนรู้และพัฒนาทักษะดิจิทัล
                            </p>
                        </div>
                        <div>
                            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#93c5fd' }}>บริการของเรา</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {['หลักสูตรอบรม', 'ห้องสมุดดิจิทัล', 'ระบบ e-Learning', 'ประกาศนียบัตร'].map(s => (
                                    <span key={s} style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'color 0.2s' }}
                                        onMouseEnter={e => e.target.style.color = '#93c5fd'}
                                        onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
                                    >{s}</span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#93c5fd' }}>ติดต่อเรา</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                                <span>📍 80 ถนนนครสวรรค์ ตำบลตลาด อำเภอเมือง จังหวัดมหาสารคาม</span>
                                <span>📞 0-4371-3618 , 0-4372-2118-9 ต่อ 160 โทรสาร 0-4372-5433</span>
                                <span>📧 lib@rmu.ac.th</span>
                                <span>🕐 จันทร์-ศุกร์ 08:30-16:30 น.</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, textAlign: 'center' }}>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                            © 2569 ระบบบริหารการจัดการอบรม สำนักวิทยบริการและเทคโนโลยีสารสนเทศ มหาวิทยาลัยราชภัฏมหาสารคาม
                        </p>
                    </div>
                </div>
            </footer>

            {/* ========== MODALS ========== */}
            {showCourseReg && (
                <CourseRegModal
                    course={showCourseReg}
                    onClose={() => setShowCourseReg(null)}
                    onSuccess={() => {
                        api.get('/courses').then(res => setCourses(res.data)).catch(() => { });
                    }}
                />
            )}
            {showCourseDetail && (
                <CourseDetailModal
                    course={showCourseDetail}
                    user={user}
                    onClose={() => setShowCourseDetail(null)}
                    onRegister={() => {
                        if (!user) { setShowCourseDetail(null); navigate('/login'); }
                        else { setShowCourseDetail(null); setShowCourseReg(showCourseDetail); }
                    }}
                />
            )}
            {showNewsDetail && (
                <NewsDetailModal
                    news={showNewsDetail}
                    onClose={() => setShowNewsDetail(null)}
                />
            )}
            {showRegistrants && (
                <RegistrantsModal
                    courseId={showRegistrants.courseId}
                    courseName={showRegistrants.courseName}
                    onClose={() => setShowRegistrants(null)}
                />
            )}
            {/* Removed inline Certificate Modal */}
            {showEvaluation && (
                <EvaluationModal
                    courseId={showEvaluation.courseId}
                    courseName={showEvaluation.courseName}
                    onClose={() => setShowEvaluation(null)}
                    onSuccess={() => {
                        setEvalStatus(prev => ({ ...prev, [showEvaluation.courseId]: true }));
                        api.get('/certificates/my').then(res => setCertificates(res.data)).catch(() => { });
                    }}
                />
            )}

            {/* ========== RESPONSIVE STYLES ========== */}
            {/* ===== Logout Confirmation Modal ===== */}
            {showLogoutConfirm && (
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                        zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
                    }}
                    onClick={() => setShowLogoutConfirm(false)}
                >
                    <div
                        style={{
                            position: 'relative', overflow: 'hidden',
                            background: 'linear-gradient(145deg, #ffffff 0%, #fff8f6 100%)',
                            borderRadius: 24, padding: '48px 36px 40px', textAlign: 'center',
                            maxWidth: 400, width: '88%',
                            boxShadow: '0 30px 90px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
                            animation: 'logoutPopIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Top gradient bar */}
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: 5,
                            background: 'linear-gradient(90deg, #f59e0b, #ef4444, #f59e0b)',
                        }} />

                        {/* Glow behind icon */}
                        <div style={{
                            position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)',
                            width: 180, height: 180, borderRadius: '50%', opacity: 0.12,
                            background: 'radial-gradient(circle, #f59e0b, transparent 70%)',
                        }} />

                        {/* Icon */}
                        <div style={{
                            width: 88, height: 88, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 20px',
                            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                            boxShadow: '0 8px 32px rgba(245,158,11,0.35)',
                            animation: 'logoutIconBounce 0.6s ease 0.2s both',
                        }}>
                            <HiOutlineExclamation size={48} color="#fff" />
                        </div>

                        {/* Title */}
                        <div style={{
                            fontSize: 24, fontWeight: 800, marginBottom: 10, letterSpacing: '-0.5px',
                            background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            ⚠️ ออกจากระบบ
                        </div>

                        {/* Message */}
                        <div style={{ fontSize: 15, color: '#777', marginBottom: 28, lineHeight: 1.6, padding: '0 8px' }}>
                            คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <button
                                style={{
                                    padding: '14px 32px', borderRadius: 14, border: '2px solid #e5e7eb',
                                    cursor: 'pointer', fontSize: 16, fontWeight: 700, color: '#666',
                                    background: '#fff', minWidth: 130,
                                    transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                                }}
                                onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.borderColor = '#ccc'; }}
                                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.borderColor = '#e5e7eb'; }}
                                onClick={() => setShowLogoutConfirm(false)}
                            >
                                ยกเลิก
                            </button>
                            <button
                                style={{
                                    padding: '14px 32px', borderRadius: 14, border: 'none',
                                    cursor: 'pointer', fontSize: 16, fontWeight: 700, color: '#fff',
                                    background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
                                    boxShadow: '0 6px 24px rgba(239,68,68,0.4)',
                                    minWidth: 130,
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                }}
                                onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; }}
                                onClick={confirmLogout}
                            >
                                ออกจากระบบ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.05); }
                }
                @keyframes logoutPopIn {
                    0% { transform: scale(0.5); opacity: 0; }
                    60% { transform: scale(1.05); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes logoutIconBounce {
                    0% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1.2); }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); opacity: 1; }
                }
                @media (max-width: 768px) {
                    .home-nav-desktop { display: none !important; }
                    .home-nav-mobile-btn { display: block !important; }
                }
                @media (min-width: 769px) {
                    .home-nav-mobile-btn { display: none !important; }
                    .home-nav-mobile-menu { display: none !important; }
                }
                div[style*="scrollbarWidth"]::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
