import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getStaffSchedule } from '../../api/scheduleAPI'; // Sử dụng API mới
import './DashboardPages.css';
import './TimeTableSchedule.css'; // <-- Sử dụng file CSS mới

// --- CÁC HÀM HELPER ---

// Tạo ra một mảng các giờ trong ngày (ví dụ: từ 7:00 đến 21:00)
const generateTimeSlots = (startHour = 7, endHour = 21) => {
    const slots = [];
    for (let i = startHour; i <= endHour; i++) {
        slots.push(`${String(i).padStart(2, '0')}:00`);
    }
    return slots;
};

// --- COMPONENT CHÍNH ---

const StaffSchedulePage = () => {
    const { user } = useAuth();
    const [mySchedule, setMySchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Cập nhật thời gian hiện tại mỗi phút để di chuyển vạch đánh dấu
    useEffect(() => {
        const timerId = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timerId);
    }, []);

    // Fetch dữ liệu lịch làm việc từ API
    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setLoading(true);
            setError(null);
            try {
                const response = await getStaffSchedule(user.id);
                if (response.isSuccess) {
                    setMySchedule(response.data);
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

    // Sử dụng useMemo để xử lý và cấu trúc lại dữ liệu lịch một cách hiệu quả
    const timetableData = useMemo(() => {
        const grid = {};
        const timeSlots = generateTimeSlots();
        const daysOfWeek = [ 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
        const dayMap = { 1: 'Chủ Nhật', 2: 'Thứ Hai', 3: 'Thứ Ba', 4: 'Thứ Tư', 5: 'Thứ Năm', 6: 'Thứ Sáu', 7: 'Thứ Bảy' };

        // Khởi tạo lưới trống
        daysOfWeek.forEach(day => {
            grid[day] = {};
            timeSlots.forEach(time => {
                grid[day][time] = { type: 'free', note: 'Ngoài giờ làm' };
            });
        });

        // Điền lịch làm việc vào lưới
        mySchedule.forEach(slot => {
            const dayName = dayMap[slot.dayOfWeek +1]; // Điều chỉnh từ 0-based sang 1-based của bạn nếu cần
            if (!dayName) return;

            const startHour = parseInt(slot.startTime.split(':')[0], 10);
            const endHour = parseInt(slot.endTime.split(':')[0], 10);

            for (let i = startHour; i < endHour; i++) {
                const time = `${String(i).padStart(2, '0')}:00`;
                if (grid[dayName] && grid[dayName][time]) {
                    grid[dayName][time] = { type: 'work', note: slot.note || 'Ca làm việc' };
                }
            }
        });
        return grid;
    }, [mySchedule]);


    // --- CÁC HÀM RENDER ---

    const renderTimeIndicator = () => {
        const now = currentTime;
        const todayIndex = (now.getDay() + 6) % 7; // Thứ 2 = 0, ..., Chủ Nhật = 6
        const topPosition = (now.getHours() - 7 + now.getMinutes() / 60) * 50; // 50px là chiều cao mỗi ô
        const leftPosition = 100 + todayIndex * ((100/7) * ((window.innerWidth -100) / window.innerWidth) ); // Cần điều chỉnh theo CSS
        
        // Chỉ hiển thị nếu thời gian hiện tại nằm trong khung giờ của bảng
        if (now.getHours() < 7 || now.getHours() > 21) return null;

        return (
            <div 
                className="time-indicator" 
                style={{
                    top: `${topPosition}px`,
                    // Left sẽ cần tính toán phức tạp hơn dựa trên chiều rộng cột
                    // Tạm thời để CSS xử lý
                }}
            >
                <div className="time-indicator-line"></div>
                <div className="time-indicator-dot"></div>
            </div>
        );
    };

    const renderContent = () => {
        if (loading) return <div className="loading-spinner"></div>;
        if (error) return <p className="error-message">{error}</p>;

        const timeSlots = generateTimeSlots();
        const daysOfWeek = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

        return (
            <div className="timetable-container">
                {/* {renderTimeIndicator()} */}
                <table className="timetable">
                    <thead>
                        <tr>
                            <th className="time-col">Giờ</th>
                            {daysOfWeek.map(day => <th key={day}>{day}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {timeSlots.map(time => (
                            <tr key={time}>
                                <td className="time-col">{time}</td>
                                {daysOfWeek.map(day => (
                                    <td 
                                        key={`${day}-${time}`} 
                                        className={`slot-${timetableData[day][time]?.type || 'free'}`}
                                    >
                                        {timetableData[day][time]?.type === 'work' ? 'Ca làm' : ''}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="dashboard-page">
            <h1 className="page-title">Lịch Làm Việc Tuần</h1>
            <p className="page-subtitle">Xem tổng quan lịch làm việc của bạn dưới dạng lưới thời gian.</p>
            <div className="content-box">
                {renderContent()}
            </div>
        </div>
    );
};

export default StaffSchedulePage;