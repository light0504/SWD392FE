import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getStaffSchedule } from '../../api/serviceapi';
import './DashboardPages.css';
import './SchedulePage.css'; // Tái sử dụng file CSS chung cho trang lịch

// Hàm helper để chuyển đổi dayOfWeek (0 = Chủ Nhật)
const getDayName = (dayOfWeek) => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return (dayOfWeek >= 0 && dayOfWeek < 7) ? days[dayOfWeek] : 'Không xác định';
};

const StaffSchedulePage = () => {
    const { user } = useAuth();
    const [mySchedule, setMySchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            setLoading(true);
            setError(null);
            try {
                const response = await getStaffSchedule(user.id);
                if (response.isSuccess) {
                    const sortedSchedule = [...response.data].sort((a, b) => {
                        if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
                        return a.startTime.localeCompare(b.startTime);
                    });
                    setMySchedule(sortedSchedule);
                } else {
                    throw new Error(response.message || "Không thể tải lịch làm việc.");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const renderContent = () => {
        if (loading) return <div className="loading-spinner"></div>;
        if (error) return <p className="error-message">{error}</p>;
        if (mySchedule.length === 0) return <p>Bạn không có lịch làm việc trong tuần này.</p>;

        return (
            <table className="schedule-table">
                <thead>
                    <tr>
                        <th>Thứ</th>
                        <th>Ca Làm Việc</th>
                        <th>Ghi Chú</th>
                    </tr>
                </thead>
                <tbody>
                    {mySchedule.map((slot, index) => (
                        <tr key={index}>
                            <td data-label="Thứ">{getDayName(slot.dayOfWeek)}</td>
                            <td data-label="Ca Làm Việc">{`${slot.startTime} - ${slot.endTime}`}</td>
                            <td data-label="Ghi Chú">{slot.note || '—'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className="dashboard-page">
            <h1 className="page-title">Lịch Làm Việc Của Tôi</h1>
            <p className="page-subtitle">Các ca làm việc đã được phân công cho bạn trong tuần.</p>
            <div className="content-box">
                {renderContent()}
            </div>
        </div>
    );
};

export default StaffSchedulePage;