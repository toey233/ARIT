// นำเข้าไลบรารีที่จำเป็นสำหรับหน้าหลักของเว็บไซต์ (Landing Page)
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CourseRegModal from '../components/CourseRegModal';
import CourseDetailModal from '../components/CourseDetailModal';
import NewsDetailModal from '../components/NewsDetailModal';
import EvaluationModal from '../components/EvaluationModal';
import RegistrantsModal from '../components/RegistrantsModal';
import ProfileModal from '../components/ProfileModal';
import NotificationDropdown from '../components/NotificationDropdown';
import HeroSection from '../components/home/HeroSection';
import CourseSection from '../components/home/CourseSection';
import NewsSection from '../components/home/NewsSection';
import FAQSection from '../components/home/FAQSection';
import FooterSection from '../components/home/FooterSection';
import {
    HiOutlineMenu, HiOutlineX, HiOutlineLogin, HiOutlineUserAdd, HiOutlineLogout, HiOutlineUserCircle, HiOutlineExclamation
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

// Color constants moved to components

// คอมโพเนนต์หน้าแรก (Landing Page) เป็นหน้าต่างบานแรกของเว็บเมื่อคนเข้ามา
export default function HomePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [courses, setCourses] = useState([]);
    const [news, setNews] = useState([]);
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
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [scrollY, setScrollY] = useState(0);

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
            setNews(newsRes.data.slice(0, 30));
        }).finally(() => setLoading(false));
    }, []);

    // Scroll to hash when loaded
    useEffect(() => {
        if (!loading && location.hash) {
            const id = location.hash.replace('#', '');
            const el = document.getElementById(id);
            if (el) {
                setTimeout(() => {
                    el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [loading, location.hash]);

    // Auto-scroll news logic moved to NewsSection
    // Pagination logic moved to CourseSection

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

    // Filters, categories, and pagination logic moved to CourseSection

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
                <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>
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
                            <div style={{ fontWeight: 700, fontSize: 16, color: '#2563eb', lineHeight: 1.2, whiteSpace: 'nowrap' }}>ระบบบริหารการจัดการอบรม</div>
                            <div style={{ fontSize: 11, color: '#999', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>ARIT Management Training System</div>
                        </div>
                    </div>

                    {/* Desktop Nav Links */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="home-nav-desktop">
                        {activeNavLinks.map((link, i) => (
                            <button key={link.label} onClick={() => handleNavClick(link)} style={{
                                background: 'none', border: 'none', padding: '8px 16px', cursor: 'pointer',
                                fontSize: 16, fontWeight: 500, color: '#555', borderRadius: 8,
                                transition: 'all 0.2s', whiteSpace: 'nowrap',
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
                                    <span style={{ fontSize: 14, color: '#555', fontWeight: 500, whiteSpace: 'nowrap' }}>{user.firstName}</span>
                                </button>
                                <button onClick={handleLogout} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                                    border: '1.5px solid #c0392b', color: '#c0392b', background: 'transparent',
                                    cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
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
                                    cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
                                }}>
                                    <HiOutlineUserAdd size={16} /> สมัครสมาชิก
                                </button>
                                <button onClick={() => navigate('/login')} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                                    background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff',
                                    cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                                    border: 'none', whiteSpace: 'nowrap',
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
            <HeroSection scrollY={scrollY} />

            {/* ========== COURSES SECTION ========== */}
            <CourseSection 
                courses={courses}
                loading={loading}
                scrollY={scrollY}
                user={user}
                setShowCourseDetail={setShowCourseDetail}
                setShowCourseReg={setShowCourseReg}
            />

            {/* ========== NEWS SECTION ========== */}
            <NewsSection 
                news={news} 
                setShowNewsDetail={setShowNewsDetail} 
            />

            {/* ========== FAQ SECTION ========== */}
            <FAQSection />

            {/* ========== FOOTER ========== */}
            <FooterSection />

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
