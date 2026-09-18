import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineStar, HiOutlineArrowLeft, HiStar } from 'react-icons/hi';

export default function Evaluation() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [already, setAlready] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // State for the 10 detailed questions
    const [form, setForm] = useState({
        c1: 5, c2: 5, c3: 5,
        i1: 5, i2: 5, i3: 5,
        f1: 5, f2: 5,
        a1: 5, a2: 5,
        comment: ''
    });

    useEffect(() => {
        Promise.all([
            api.get(`/courses/${courseId}`),
            api.get(`/evaluations/check/${courseId}`)
        ]).then(([courseRes, checkRes]) => {
            setCourse(courseRes.data);
            setAlready(checkRes.data.evaluated);
            setLoading(false);
        }).catch(() => { setLoading(false); navigate('/my-registrations'); });
    }, [courseId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Calculate averages for categories
            const contentRating = Math.round((form.c1 + form.c2 + form.c3) / 3);
            const instructorRating = Math.round((form.i1 + form.i2 + form.i3) / 3);
            const facilityRating = Math.round((form.f1 + form.f2) / 2);
            const applicationRating = Math.round((form.a1 + form.a2) / 2);
            const overallRating = Math.round((form.c1 + form.c2 + form.c3 + form.i1 + form.i2 + form.i3 + form.f1 + form.f2 + form.a1 + form.a2) / 10);

            const payload = {
                courseId,
                rating: overallRating,
                contentRating,
                instructorRating,
                facilityRating,
                applicationRating,
                comment: form.comment,
                details: {
                    c1: form.c1, c2: form.c2, c3: form.c3,
                    i1: form.i1, i2: form.i2, i3: form.i3,
                    f1: form.f1, f2: form.f2,
                    a1: form.a1, a2: form.a2
                }
            };

            await api.post('/evaluations', payload);
            toast.success('ส่งแบบประเมินสำเร็จ!');
            navigate('/my-registrations');
        } catch (err) {
            toast.error(err.response?.data?.message || 'ส่งไม่สำเร็จ');
        } finally {
            setSubmitting(false);
        }
    };

    const RatingRow = ({ label, name }) => (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface-50 rounded-xl mb-3">
            <span className="text-sm text-surface-700 font-medium mb-3 sm:mb-0">{label}</span>
            <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} type="button" onClick={() => setForm({ ...form, [name]: n })}
                            className="focus:outline-none transition-transform hover:scale-110">
                            {n <= form[name] 
                                ? <HiStar className="w-6 h-6 text-yellow-500" />
                                : <HiStar className="w-6 h-6 text-surface-300 hover:text-yellow-300" />
                            }
                        </button>
                    ))}
                </div>
                <span className="w-6 text-center font-bold text-primary-600 ml-2">{form[name]}</span>
            </div>
        </div>
    );

    const SectionTitle = ({ number, title }) => (
        <div className="border-b border-surface-200 pb-2 mb-4 mt-8 flex justify-between items-end">
            <h3 className="text-lg font-bold text-surface-800">{number}. {title}</h3>
        </div>
    );

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <button onClick={() => navigate('/my-registrations')} className="flex items-center gap-2 text-surface-500 hover:text-primary-600 transition-colors">
                <HiOutlineArrowLeft className="w-5 h-5" /> กลับไปหน้าลงทะเบียน
            </button>

            <div className="card border-0 shadow-lg p-0 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-8 text-white">
                    <h1 className="text-2xl font-bold mb-2">แบบประเมินความพึงพอใจ</h1>
                    <p className="opacity-90">{course?.title}</p>
                </div>

                <div className="p-8">
                    {already ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <HiStar className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h2 className="text-xl font-bold text-surface-800 mb-2">คุณได้ประเมินหลักสูตรนี้ไปแล้ว</h2>
                            <p className="text-surface-500">ขอบคุณสำหรับความคิดเห็นที่ช่วยให้เราพัฒนาหลักสูตรให้ดียิ่งขึ้น</p>
                            <button onClick={() => navigate('/my-registrations')} className="mt-8 btn-primary">
                                กลับไปหน้าหลัก
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="text-right text-sm text-surface-500 mb-2 font-medium">5 = มากที่สุด, 1 = น้อยที่สุด</div>
                            
                            <SectionTitle number="1" title="ด้านเนื้อหาและเวลา" />
                            <RatingRow label="1.1 เนื้อหาตรงตามวัตถุประสงค์และครบถ้วน" name="c1" />
                            <RatingRow label="1.2 การจัดลำดับเนื้อหาเข้าใจง่าย" name="c2" />
                            <RatingRow label="1.3 ระยะเวลาอบรมมีความเหมาะสม" name="c3" />

                            <SectionTitle number="2" title="ด้านวิทยากร" />
                            <RatingRow label="2.1 วิทยากรมีความรู้ความเชี่ยวชาญ" name="i1" />
                            <RatingRow label="2.2 ถ่ายทอดชัดเจนและน่าสนใจ" name="i2" />
                            <RatingRow label="2.3 เปิดโอกาสให้ซักถามและตอบข้อสงสัย" name="i3" />

                            <SectionTitle number="3" title="ด้านสถานที่และสื่อประกอบ" />
                            <RatingRow label="3.1 เอกสาร/สื่อประกอบการอบรมพร้อมและดี" name="f1" />
                            <RatingRow label="3.2 สถานที่/ระบบเทคโนโลยีมีความเหมาะสม" name="f2" />

                            <SectionTitle number="4" title="ด้านการนำไปใช้ประโยชน์" />
                            <RatingRow label="4.1 ได้รับความรู้และทักษะใหม่เพิ่มขึ้น" name="a1" />
                            <RatingRow label="4.2 สามารถนำไปประยุกต์ใช้ในงานได้จริง" name="a2" />

                            <div className="mt-10 mb-8">
                                <h3 className="text-lg font-bold text-surface-800 mb-4">ข้อเสนอแนะเพิ่มเติม</h3>
                                <textarea 
                                    value={form.comment} 
                                    onChange={e => setForm({ ...form, comment: e.target.value })}
                                    className="input-field h-32 resize-none w-full border-surface-300 rounded-xl p-4 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                                    placeholder="พิมพ์ข้อเสนอแนะของคุณที่นี่..." 
                                />
                            </div>
                            
                            <button type="submit" disabled={submitting} className="btn-primary w-full py-4 text-lg rounded-xl shadow-lg shadow-primary-500/30 disabled:opacity-50">
                                {submitting ? <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white mx-auto"></div> : 'ส่งแบบประเมิน'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
