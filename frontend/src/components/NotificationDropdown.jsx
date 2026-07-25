import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineBell, HiCheckCircle, HiOutlineExclamationCircle, HiOutlineInformationCircle } from 'react-icons/hi';
import api from '../services/api';

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Setup polling every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = async (notif) => {
        if (!notif.isRead) {
            try {
                await api.put(`/notifications/${notif.id}/read`);
                setNotifications(notifications.map(n => 
                    n.id === notif.id ? { ...n, isRead: true } : n
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (e) {
                console.error('Failed to mark as read', e);
            }
        }
        setIsOpen(false);
        if (notif.link) {
            navigate(notif.link);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (e) {
            console.error('Failed to mark all as read', e);
        }
    };

    const getIcon = (type) => {
        switch(type) {
            case 'approval': return <HiCheckCircle className="w-5 h-5 text-emerald-500" />;
            case 'rejection': return <HiOutlineExclamationCircle className="w-5 h-5 text-red-500" />;
            case 'certificate': return <HiCheckCircle className="w-5 h-5 text-amber-500" />;
            default: return <HiOutlineInformationCircle className="w-5 h-5 text-primary-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex items-center justify-center w-10 h-10 rounded-xl text-surface-500 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
            >
                <HiOutlineBell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-surface-200 z-50 overflow-hidden transform origin-top-right transition-all">
                    <div className="p-4 border-b border-surface-100 flex items-center justify-between bg-surface-50">
                        <h3 className="font-bold text-surface-900">การแจ้งเตือน</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={markAllAsRead}
                                className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
                            >
                                อ่านทั้งหมด
                            </button>
                        )}
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-surface-500 flex flex-col items-center gap-2">
                                <HiOutlineBell className="w-8 h-8 opacity-20" />
                                <p className="text-sm">ไม่มีการแจ้งเตือนใหม่</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-surface-100">
                                {notifications.map(notif => (
                                    <button
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`w-full text-left p-4 hover:bg-surface-50 transition-colors flex gap-3 ${!notif.isRead ? 'bg-primary-50/30' : ''}`}
                                    >
                                        <div className="mt-1 shrink-0">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium text-surface-900 ${!notif.isRead ? 'font-bold' : ''}`}>
                                                {notif.title}
                                            </p>
                                            <p className="text-xs text-surface-600 mt-1 line-clamp-2">
                                                {notif.message}
                                            </p>
                                            <p className="text-[10px] text-surface-400 mt-2">
                                                {new Date(notif.createdAt).toLocaleString('th-TH')}
                                            </p>
                                        </div>
                                        {!notif.isRead && (
                                            <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-2"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
