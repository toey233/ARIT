// นำเข้าไอคอนที่จำเป็นสำหรับหน้าคู่มือการใช้งาน
import { HiOutlineQuestionMarkCircle, HiOutlineAcademicCap, HiOutlineClipboardList, HiOutlineDocumentText, HiOutlineStar, HiOutlineUsers, HiOutlineNewspaper } from 'react-icons/hi';

// คอมโพเนนต์หน้า "คู่มือการใช้งาน" (Help) แนะนำวิธีการใช้งานระบบสำหรับผู้ใช้แต่ละกลุ่ม
export default function Help() {
    const sections = [
        {
            title: 'สำหรับนักศึกษา / ผู้ใช้ทั่วไป',
            icon: HiOutlineAcademicCap,
            color: 'emerald',
            items: [
                { title: 'การดูหลักสูตรอบรม', desc: 'ไปที่เมนู "หลักสูตรอบรม" เพื่อดูรายการหลักสูตรทั้งหมดที่เปิดสอน สามารถค้นหาและกรองตามหมวดหมู่ได้' },
                { title: 'การลงทะเบียนอบรม', desc: 'คลิกที่หลักสูตรที่ต้องการ แล้วกดปุ่ม "ลงทะเบียนอบรม" รอเจ้าหน้าที่อนุมัติ ตรวจสอบสถานะได้ที่ "การลงทะเบียนของฉัน"' },
                { title: 'การทำแบบประเมิน', desc: 'หลังจากผ่านการอบรม เข้าที่ "การลงทะเบียนของฉัน" แล้วกด "ทำแบบประเมิน" เพื่อกรอกแบบประเมินความพึงพอใจ' },
                { title: 'การดาวน์โหลดประกาศนียบัตร', desc: 'เมื่อเจ้าหน้าที่ออกประกาศนียบัตรให้แล้ว เข้าที่เมนู "ประกาศนียบัตร" กด "ดู/พิมพ์" เพื่อดาวน์โหลด E-Certificate' },
            ]
        },
        {
            title: 'สำหรับเจ้าหน้าที่ (Staff)',
            icon: HiOutlineClipboardList,
            color: 'amber',
            items: [
                { title: 'การจัดการหลักสูตร', desc: 'ไปที่ "จัดการหลักสูตร" เพื่อเพิ่ม แก้ไข หรือลบหลักสูตรอบรม กำหนดผู้สอน เนื้อหา เอกสารประกอบ' },
                { title: 'การจัดการลงทะเบียน', desc: 'ตรวจสอบรายการลงทะเบียนที่ "จัดการลงทะเบียน" กดอนุมัติหรือปฏิเสธการสมัคร' },
                { title: 'การดูผลประเมิน', desc: 'ไปที่ "ผลการประเมิน" เลือกหลักสูตร เพื่อดูคะแนนประเมินเฉลี่ยและข้อเสนอแนะ' },
                { title: 'การออกประกาศนียบัตร', desc: 'ไปที่ "ออกประกาศนียบัตร" เลือกหลักสูตร แล้วกดออกประกาศนียบัตรให้ผู้ที่ผ่านการอบรม' },
                { title: 'การจัดการข่าวสาร', desc: 'ไปที่ "จัดการข่าวสาร" เพื่อเพิ่ม แก้ไข หรือลบข่าวประชาสัมพันธ์ กำหนดการอบรม' },
            ]
        },
        {
            title: 'สำหรับผู้ดูแลระบบ (Admin)',
            icon: HiOutlineUsers,
            color: 'red',
            items: [
                { title: 'การจัดการผู้ใช้', desc: 'ไปที่ "จัดการผู้ใช้" เพื่อดูรายชื่อผู้ใช้ทั้งหมด เปลี่ยนสิทธิ์ (User/Staff/Admin) หรือลบบัญชี' },
                { title: 'การดูรายงานและสถิติ', desc: 'ไปที่ "รายงาน/สถิติ" เพื่อดูภาพรวม จำนวนผู้ใช้ หลักสูตร ลงทะเบียน คะแนนประเมิน และประกาศนียบัตร' },
                { title: 'สิทธิ์ของ Admin', desc: 'ผู้ดูแลระบบสามารถเข้าถึงทุกฟังก์ชันในระบบ รวมถึงฟังก์ชันของเจ้าหน้าที่ด้วย' },
            ]
        }
    ];

    const colorMap = {
        emerald: { bg: 'bg-emerald-500/20', icon: 'text-emerald-400', border: 'border-emerald-500/20' },
        amber: { bg: 'bg-amber-500/20', icon: 'text-amber-400', border: 'border-amber-500/20' },
        red: { bg: 'bg-red-500/20', icon: 'text-red-400', border: 'border-red-500/20' },
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500/20 mb-4">
                    <HiOutlineQuestionMarkCircle className="w-8 h-8 text-primary-400" />
                </div>
                <h1 className="section-title text-3xl">คู่มือการใช้งาน</h1>
                <p className="text-surface-400 mt-2">ระบบบริหารการจัดการอบรม สำนักวิทยบริการและเทคโนโลยีสารสนเทศ</p>
            </div>

            {sections.map((section, idx) => {
                const colors = colorMap[section.color];
                return (
                    <div key={idx} className="glass-card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                                <section.icon className={`w-5 h-5 ${colors.icon}`} />
                            </div>
                            <h2 className="text-lg font-semibold text-white">{section.title}</h2>
                        </div>
                        <div className="space-y-4">
                            {section.items.map((item, i) => (
                                <div key={i} className={`p-4 rounded-xl bg-surface-800/50 border ${colors.border}`}>
                                    <h3 className="font-semibold text-white text-lg mb-2">{i + 1}. {item.title}</h3>
                                    <p className="text-base text-surface-200 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}


        </div>
    );
}
