import React, { useState, useEffect, useMemo } from 'react';
import { getAllStaffSchedule } from '../../api/scheduleAPI';
import './DashboardPages.css';
import './TimeTableSchedule.css'; // Tái sử dụng và mở rộng file CSS này

// --- CÁC HÀM HELPER ---
const generateTimeSlots = (startHour = 7, endHour = 21) => {
    const slots = [];
    for (let i = startHour; i <= endHour; i++) {
        slots.push(`${String(i).padStart(2, '0')}:00`);
    }
    return slots;
};

// --- COMPONENT CHÍNH ---
const ManagerSchedulePage = () => {
    const [allSchedules, setAllSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const schedulesRes = await getAllStaffSchedule();
                if (schedulesRes.isSuccess) {
                    setAllSchedules(schedulesRes.data);
                } else {
                    throw new Error(schedulesRes.message || "Lỗi tải lịch làm việc.");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Sử dụng useMemo để xử lý và cấu trúc lại dữ liệu thành một lưới tổng hợp
    const timetableData = useMemo(() => {
        const grid = {};
        const timeSlots = generateTimeSlots();
        const daysOfWeek = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
        const dayMap = { 1: 'Chủ Nhật', 2: 'Thứ Hai', 3: 'Thứ Ba', 4: 'Thứ Tư', 5: 'Thứ Năm', 6: 'Thứ Sáu', 7: 'Thứ Bảy' };

        // Khởi tạo lưới trống, mỗi ô là một mảng để chứa tên nhân viên
        daysOfWeek.forEach(day => {
            grid[day] = {};
            timeSlots.forEach(time => {
                grid[day][time] = []; // Mảng chứa danh sách nhân viên làm việc
            });
        });

        // Điền tên nhân viên vào các ô tương ứng trên lưới
        allSchedules.forEach(slot => {
            const dayName = dayMap[slot.dayOfWeek+1]; // Điều chỉnh nếu cần
            if (!dayName) return;

            const startHour = parseInt(slot.startTime.split(':')[0], 10);
            const endHour = parseInt(slot.endTime.split(':')[0], 10);

            for (let i = startHour; i < endHour; i++) {
                const time = `${String(i).padStart(2, '0')}:00`;
                if (grid[dayName] && grid[dayName][time]) {
                    // Thêm tên nhân viên vào mảng của ô giờ đó
                    grid[dayName][time].push(slot.staffName);
                }
            }
        });
        return grid;
    }, [allSchedules]);

    const renderContent = () => {
        if (loading) return <div className="loading-spinner"></div>;
        if (error) return <p className="error-message">{error}</p>;

        const timeSlots = generateTimeSlots();
        const daysOfWeek = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

        return (
            <div className="timetable-container">
                <table className="timetable manager-timetable">
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
                                {daysOfWeek.map(day => {
                                    const staffInSlot = timetableData[day]?.[time] || [];
                                    const staffCount = staffInSlot.length;
                                    const cellClass = staffCount > 0 ? 'slot-occupied' : 'slot-empty';

                                    return (
                                        <td key={`${day}-${time}`} className={cellClass}>
                                            {/* Hiển thị số lượng nhân viên */}
                                            {staffCount > 0 && (
                                                <div className="slot-content">
                                                    <span className="staff-count">{staffCount} NV</span>
                                                    {/* Tooltip sẽ được tạo bằng CSS */}
                                                    <div className="tooltip">
                                                        <ul>
                                                            {staffInSlot.map((name, index) => (
                                                                <li key={index}>{name}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}
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
            <h1 className="page-title">Tổng Quan Lịch Làm Việc</h1>
            <p className="page-subtitle">Xem mật độ nhân viên theo từng khung giờ trong tuần.</p>
            <div className="content-box">
                {renderContent()}
            </div>
        </div>
    );
};

export default ManagerSchedulePage;