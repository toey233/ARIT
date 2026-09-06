// นำเข้าไอคอนที่จำเป็นสำหรับหน้าคู่มือการใช้งาน
import { HiOutlineQuestionMarkCircle, HiOutlineAcademicCap, HiOutlineClipboardList, HiOutlineCog } from 'react-icons/hi';

export default function Help() {
    const sections = [
        {
            title: 'สำหรับนักศึกษา / ผู้ใช้ทั่วไป',
            icon: HiOutlineAcademicCap,
            color: 'emerald',
            items: [
                { title: 'หน้าแรก (Dashboard)', desc: 'หน้าแรกของระบบ จะแสดงหลักสูตรที่กำลังเปิดรับสมัคร สถิติการเข้าอบรมของคุณ และข่าวสารล่าสุด' },
                { title: 'การดูและค้นหาหลักสูตร', desc: 'ไปที่เมนู "หลักสูตรอบรม" เพื่อดูรายการหลักสูตรทั้งหมดที่เปิดสอน คุณสามารถค้นหาด้วยชื่อหลักสูตร หรือกรองตามหมวดหมู่ได้' },
                { title: 'การลงทะเบียนอบรม', desc: 'คลิกที่หลักสูตรที่สนใจเพื่อดูรายละเอียด หากหลักสูตรยังเปิดรับสมัคร ให้กดปุ่ม "ลงทะเบียนอบรม" ระบบจะส่งคำขอไปยังเจ้าหน้าที่เพื่อพิจารณา' },
                { title: 'ติดตามสถานะการลงทะเบียน', desc: 'ไปที่เมนู "การลงทะเบียนของฉัน" เพื่อตรวจสอบว่าคำขอของคุณได้รับการ "อนุมัติ" แล้วหรือไม่ และสามารถดูประวัติการลงทะเบียนทั้งหมดได้ที่นี่' },
                { title: 'การทำแบบประเมิน', desc: 'เมื่อคุณผ่านการอบรมแล้ว ในหน้า "การลงทะเบียนของฉัน" จะมีปุ่ม "ทำแบบประเมิน" ปรากฏขึ้น คุณต้องทำแบบประเมินให้เสร็จสิ้นก่อนจึงจะสามารถรับประกาศนียบัตรได้' },
                { title: 'การรับประกาศนียบัตร', desc: 'หลังจากทำแบบประเมินแล้ว ไปที่เมนู "ประกาศนียบัตร" หรือ "ผลการอบรม" เพื่อดาวน์โหลด E-Certificate ของคุณในรูปแบบ PDF' },
                { title: 'จัดการข้อมูลส่วนตัว', desc: 'ไปที่มุมขวาบน เลือก "โปรไฟล์ของฉัน" เพื่อแก้ไขข้อมูลส่วนตัว เปลี่ยนรหัสผ่าน หรืออัปเดตข้อมูลหน่วยงาน' },
            ]
        },
        {
            title: 'สำหรับเจ้าหน้าที่ (Staff)',
            icon: HiOutlineClipboardList,
            color: 'amber',
            items: [
                { title: 'การจัดการหลักสูตร (Course Manage)', desc: 'ไปที่ "จัดการหลักสูตร" เพื่อ สร้าง แก้ไข หรือลบหลักสูตรอบรม โดยสามารถอัปโหลดภาพหน้าปก ตั้งค่าพื้นหลังประกาศนียบัตร (Template A4) และแนบลายเซ็นวิทยากร/ผู้อำนวยการ (ระบบตัดพื้นหลังให้อัตโนมัติ)' },
                { title: 'การจัดการลงทะเบียน (Registration Manage)', desc: 'ไปที่ "จัดการลงทะเบียน" เลือกหลักสูตรที่ต้องการ เพื่อ อนุมัติ/ปฏิเสธ ผู้สมัคร หรือใช้ฟังก์ชัน "นำเข้าจาก Excel" เพื่อเพิ่มผู้เข้าอบรมทีละหลายคน เมื่ออบรมเสร็จสิ้น สามารถปรับสถานะเป็น "ผ่านการอบรม" ได้ที่นี่' },
                { title: 'การออกประกาศนียบัตร (Certificate Manage)', desc: 'ไปที่ "จัดการประกาศนียบัตร" เลือกหลักสูตร และเลือกรายชื่อผู้ที่ผ่านการอบรมเพื่อกด "สร้างประกาศนียบัตร" ให้กับผู้ใช้เหล่านั้น' },
                { title: 'การจัดการข่าวสาร (News Manage)', desc: 'ไปที่ "จัดการข่าวสาร" เพื่อเพิ่ม แก้ไข หรือลบข่าวประชาสัมพันธ์ สามารถอัปโหลดรูปภาพประกอบและ "ปักหมุด" ข่าวสำคัญให้อยู่บนสุดได้' },
                { title: 'การดูผลประเมิน (Evaluation Results)', desc: 'ไปที่ "ผลการประเมิน" เลือกหลักสูตร เพื่อดูสรุปคะแนนความพึงพอใจในด้านต่างๆ ค่าเฉลี่ย และข้อเสนอแนะเพิ่มเติมจากผู้เข้าอบรม' },
                { title: 'การดูรายงาน (Reports)', desc: 'ไปที่ "รายงาน/สถิติ" เพื่อดูข้อมูลสรุปภาพรวมของระบบ เช่น จำนวนผู้เข้าอบรม หลักสูตรยอดนิยม และสามารถ Export ข้อมูลออกมาในรูปแบบ Excel หรือ PDF ได้' },
            ]
        },
        {
            title: 'สำหรับผู้ดูแลระบบ (Admin)',
            icon: HiOutlineCog,
            color: 'red',
            items: [
                { title: 'สิทธิ์การใช้งานที่ครอบคลุม', desc: 'ผู้ดูแลระบบ (Admin) จะสามารถเข้าถึงและใช้งานทุกฟังก์ชันของเจ้าหน้าที่ (Staff) ได้ทั้งหมด' },
                { title: 'การจัดการผู้ใช้งาน (User Manage)', desc: 'ไปที่ "จัดการผู้ใช้" เพื่อดูแลบัญชีผู้ใช้ในระบบทั้งหมด สามารถปรับเปลี่ยนสิทธิ์ (Role) ระหว่าง User, Staff และ Admin หรือลบบัญชีผู้ใช้ที่ไม่ต้องการได้' },
                { title: 'การตั้งค่าและดูแลระบบโดยรวม', desc: 'ผู้ดูแลระบบสามารถตรวจสอบการทำงานของระบบ จัดการรายงานสถิติขั้นสูง และแก้ไขปัญหาที่เกิดขึ้นกับผู้ใช้งานทั่วไปได้' },
            ]
        }
    ];

    const colorMap = {
        emerald: { bg: 'bg-emerald-500/20', icon: 'text-emerald-400', border: 'border-emerald-500/20' },
        amber: { bg: 'bg-amber-500/20', icon: 'text-amber-400', border: 'border-amber-500/20' },
        red: { bg: 'bg-red-500/20', icon: 'text-red-400', border: 'border-red-500/20' },
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-10">
            <div className="text-center bg-gradient-to-br from-surface-800 to-surface-900 p-8 rounded-3xl border border-surface-700 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-accent-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 mb-6 border border-primary-500/30 shadow-lg relative z-10">
                    <HiOutlineQuestionMarkCircle className="w-10 h-10 text-primary-400" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 relative z-10">คู่มือการใช้งานระบบ</h1>
                <p className="text-surface-200 text-lg max-w-2xl mx-auto relative z-10">ระบบบริหารการจัดการอบรม สำนักวิทยบริการและเทคโนโลยีสารสนเทศ (ARIT-RMU) ครอบคลุมการใช้งานสำหรับทุกระดับสิทธิ์</p>
            </div>

            {sections.map((section, idx) => {
                const colors = colorMap[section.color];
                return (
                    <div key={idx} className="glass-card p-6 md:p-8 relative overflow-hidden transition-all hover:border-surface-600">
                        <div className={`absolute top-0 right-0 w-64 h-64 ${colors.bg} rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-20 pointer-events-none`}></div>
                        
                        <div className="flex items-center gap-4 mb-8 relative z-10 border-b border-surface-700 pb-4">
                            <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center shadow-lg border ${colors.border}`}>
                                <section.icon className={`w-7 h-7 ${colors.icon}`} />
                            </div>
                            <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                            {section.items.map((item, i) => (
                                <div key={i} className={`p-5 rounded-xl bg-surface-800/40 border border-surface-700 hover:${colors.border} transition-colors group h-full`}>
                                    <h3 className="font-semibold text-white text-lg mb-3 flex items-start gap-3">
                                        <span className={`flex-shrink-0 w-7 h-7 rounded-full ${colors.bg} ${colors.icon} flex items-center justify-center text-sm mt-0.5 shadow-inner`}>{i + 1}</span>
                                        <span className="group-hover:text-primary-300 transition-colors">{item.title}</span>
                                    </h3>
                                    <p className="text-sm md:text-base text-surface-100 leading-relaxed ml-10">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
