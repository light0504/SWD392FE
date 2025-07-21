import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getStaffSchedule } from '../../api/scheduleAPI';
import { getStaffOrders } from '../../api/orderAPI';
import './DashboardPages.css';
import './TimeTableSchedule.css';

// --- CÁC HÀM HELPER ---
const generateTimeSlots = (startHour = 7, endHour = 21) => {
    const slots = [];
    for (let i = startHour; i <= endHour; i++) {
        slots.push(`${String(i).padStart(2, '0')}:00`);
    }
    return slots;
};

// Ánh xạ từ getDay() (0=CN) của JS sang tên ngày Tiếng Việt
const DAY_MAP_JS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
// Ánh xạ từ API (0=CN) sang tên ngày Tiếng Việt
const DAY_MAP_API = { 0: 'Chủ Nhật', 1: 'Thứ Hai', 2: 'Thứ Ba', 3: 'Thứ Tư', 4: 'Thứ Năm', 5: 'Thứ Sáu', 6: 'Thứ Bảy' };


const StaffSchedulePage = () => {
    const { user } = useAuth();
    const [mySchedule, setMySchedule] = useState([]);
    const [myTasks, setMyTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Cập nhật thời gian hiện tại mỗi phút
    useEffect(() => {
        const timerId = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timerId);
    }, []);

    // Fetch dữ liệu từ API
    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setLoading(true);
            setError(null);
            try {
                const [scheduleRes, ordersRes] = await Promise.all([
                    getStaffSchedule(user.id),
                    getStaffOrders(user.id)
                ]);

                if (scheduleRes.isSuccess) setMySchedule(scheduleRes.data);
                else throw new Error(scheduleRes.message || "Không thể tải lịch làm việc.");

                if (ordersRes.isSuccess) {
                    const allDetails = ordersRes.data.flatMap(order => 
                        order.orderDetails.map(detail => ({
                            ...detail,
                            customerName: order.customerName || 'Khách hàng',
                        }))
                    );
                    setMyTasks(allDetails);
                } else throw new Error(ordersRes.message || "Không thể tải danh sách công việc.");

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    // Xử lý và cấu trúc dữ liệu lịch
    const timetableData = useMemo(() => {
        const grid = {};
        const timeSlots = generateTimeSlots();
        const daysOfWeek = DAY_MAP_JS.slice(1).concat(DAY_MAP_JS[0]); // Thứ 2 -> CN

        daysOfWeek.forEach(day => {
            grid[day] = {};
            timeSlots.forEach(time => {
                grid[day][time] = { type: 'free', tasks: [] };
            });
        });

        mySchedule.forEach(slot => {
            const dayName = DAY_MAP_API[slot.dayOfWeek];
            if (!dayName) return;
            const startHour = parseInt(slot.startTime.split(':')[0], 10);
            const endHour = parseInt(slot.endTime.split(':')[0], 10);

            for (let i = startHour; i < endHour; i++) {
                const time = `${String(i).padStart(2, '0')}:00`;
                if (grid[dayName]?.[time]) grid[dayName][time].type = 'available';
            }
        });

        myTasks.forEach(task => {
            const taskDate = new Date(task.scheduledTime);
            const dayName = DAY_MAP_JS[taskDate.getDay()];
            const hour = taskDate.getHours();
            const time = `${String(hour).padStart(2, '0')}:00`;

            if (grid[dayName]?.[time]) {
                grid[dayName][time].type = 'booked';
                grid[dayName][time].tasks.push(task);
            }
        });
        return grid;
    }, [mySchedule, myTasks]);

    // Render vạch chỉ báo thời gian hiện tại
    const renderTimeIndicator = () => {
        const now = currentTime;
        const dayIndex = (now.getDay() === 0) ? 6 : now.getDay() - 1; 
        const topPosition = (now.getHours() - 7 + now.getMinutes() / 60) * 50;
        if (now.getHours() < 7 || now.getHours() > 21) return null;
        return (
            <div className="time-indicator" style={{ top: `${topPosition}px`, '--current-day-index': dayIndex }}>
                <div className="time-indicator-dot"></div>
            </div>
        );
    };

    // Render nội dung chính của trang
    const renderContent = () => {
        if (loading) return <div className="loading-spinner"></div>;
        if (error) return <p className="error-message">{error}</p>;

        const timeSlots = generateTimeSlots();
        const daysOfWeek = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
        const todayName = DAY_MAP_JS[new Date().getDay()];

        return (
            <div className="timetable-container">
                {renderTimeIndicator()}
                <table className="timetable">
                    <thead>
                        <tr>
                            <th className="time-col">Giờ</th>
                            {daysOfWeek.map(day => (
                                <th key={day} className={day === todayName ? 'is-today' : ''}>
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {timeSlots.map(time => (
                            <tr key={time}>
                                <td className="time-col">{time}</td>
                                {daysOfWeek.map(day => {
                                    const cellData = timetableData[day]?.[time];
                                    const todayClass = day === todayName ? 'is-today' : '';
                                    if (!cellData) return <td key={`${day}-${time}`} className={`slot-free ${todayClass}`}></td>;
                                    
                                    return (
                                        <td key={`${day}-${time}`} className={`slot-${cellData.type} ${todayClass}`}>
                                            {cellData.type === 'booked' && (
                                                <div className="task-info">
                                                    {cellData.tasks.map((task, index) => (
                                                        <div key={index} className="task-item">
                                                            <div className="task-service">{task.serviceName}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {cellData.type === 'available' && <span className="available-text">Trống</span>}
                                        </td>
                                    );
                                })}
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
            <p className="page-subtitle">Xem tổng quan lịch làm việc và các lịch hẹn đã được phân công.</p>
            <div className="content-box">
                {renderContent()}
            </div>
        </div>
    );
};

export default StaffSchedulePage;