import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineStar, HiOutlineArrowLeft } from 'react-icons/hi';

export default function Evaluation() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [already, setAlready] = useState(false);
    const [form, setForm] = useState({ rating: 5, contentRating: 5, instructorRating: 5, facilityRating: 5, comment: '' });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

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
            await api.post('/evaluations', { courseId, ...form });
            toast.success('ส่งแบบประเมินสำเร็จ!');
            navigate('/my-registrations');
        } catch (err) {
            toast.error(err.response?.data?.message || 'ส่งไม่สำเร็จ');
        } finally {
            setSubmitting(false);
        }
    };

    const RatingInput = ({ label, name, value }) => (
        <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">{label}</label>
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} type="button" onClick={() => setForm({ ...form, [name]: n })}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${n <= value ? 'bg-yellow-500 text-white shadow-lg' : 'bg-surface-800 text-surface-500 hover:bg-surface-700'}`}>
                        <HiOutlineStar className="w-5 h-5" />
                    </button>
                ))}
                <span className="flex items-center ml-2 text-sm text-surface-400">{value}/5</span>
            </div>
        </div>
    );

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <button onClick={() => navigate('/my-registrations')} className="flex items-center gap-2 text-surface-400 hover:text-white transition-colors">
                <HiOutlineArrowLeft className="w-5 h-5" /> กลับ
            </button>

            <div className="glass-card p-8">
                <h1 className="text-xl font-bold text-white mb-2">แบบประเมินการอบรม</h1>
                <p className="text-surface-400 mb-6">{course?.title}</p>

                {already ? (
                    <div className="text-center py-8">
                        <HiOutlineStar className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                        <p className="text-white text-lg font-medium">คุณประเมินหลักสูตรนี้แล้ว</p>
                        <p className="text-surface-400 text-sm mt-2">ขอบคุณสำหรับความคิดเห็นของคุณ</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <RatingInput label="ความพึงพอใจโดยรวม" name="rating" value={form.rating} />
                        <RatingInput label="เนื้อหาการอบรม" name="contentRating" value={form.contentRating} />
                        <RatingInput label="วิทยากร/ผู้สอน" name="instructorRating" value={form.instructorRating} />
                        <RatingInput label="สถานที่และสิ่งอำนวยความสะดวก" name="facilityRating" value={form.facilityRating} />
                        <div>
                            <label className="block text-sm font-medium text-surface-300 mb-2">ข้อเสนอแนะ</label>
                            <textarea value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })}
                                className="input-field h-28 resize-none" placeholder="ข้อเสนอแนะเพิ่มเติม..." />
                        </div>
                        <button type="submit" disabled={submitting} className="btn-primary w-full py-3 disabled:opacity-50">
                            {submitting ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mx-auto"></div> : 'ส่งแบบประเมิน'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
