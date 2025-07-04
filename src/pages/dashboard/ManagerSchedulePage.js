import React, { useState, useEffect, useMemo } from 'react';
import { getAllStaffSchedule } from '../../api/serviceapi';
import { getAllStaff } from '../../api/serviceapi';
import './DashboardPages.css';
import './SchedulePage.css'; // Tái sử dụng file CSS chung cho trang lịch

// Hàm helper để chuyển đổi dayOfWeek (0 = Chủ Nhật)
const getDayName = (dayOfWeek) => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return (dayOfWeek >= 0 && dayOfWeek < 7) ? days[dayOfWeek] : 'Không xác định';
};

const ManagerSchedulePage = () => {
    const [allSchedules, setAllSchedules] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [selectedStaffName, setSelectedStaffName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [schedulesRes, staffRes] = await Promise.all([
                    getAllStaffSchedule(),
                    getAllStaff()
                ]);

                if (schedulesRes.isSuccess) setAllSchedules(schedulesRes.data);
                else throw new Error(schedulesRes.message || "Lỗi tải lịch làm việc.");

                if (staffRes.isSuccess) setStaffList(staffRes.data);
                else throw new Error(staffRes.message || "Lỗi tải danh sách nhân viên.");

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const displayedSchedules = useMemo(() => {
        const dataToFilter = allSchedules || [];
        let schedulesToDisplay = selectedStaffName
            ? dataToFilter.filter(slot => slot.staffName === selectedStaffName)
            : dataToFilter;

        return [...schedulesToDisplay].sort((a, b) => {
            if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
            return a.startTime.localeCompare(b.startTime);
        });
    }, [allSchedules, selectedStaffName]);

    const renderContent = () => {
        if (loading) return <div className="loading-spinner"></div>;
        if (error) return <p className="error-message">{error}</p>;
        if (displayedSchedules.length === 0) return <p>Không có lịch làm việc để hiển thị.</p>;
        
        return (
            <table className="schedule-table">
                <thead>
                    <tr>
                        <th>Thứ</th>
                        <th>Ca Làm Việc</th>
                        <th>Tên Nhân Viên</th>
                        <th>Ghi Chú</th>
                    </tr>
                </thead>
                <tbody>
                    {displayedSchedules.map((slot, index) => (
                        <tr key={`${slot.staffName}-${index}`}>
                            <td data-label="Thứ">{getDayName(slot.dayOfWeek)}</td>
                            <td data-label="Ca Làm Việc">{`${slot.startTime} - ${slot.endTime}`}</td>
                            <td data-label="Nhân Viên">{slot.staffName}</td>
                            <td data-label="Ghi Chú">{slot.note || '—'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className="dashboard-page">
            <h1 className="page-title">Quản Lý Lịch Làm Việc</h1>
            <p className="page-subtitle">Xem và lọc lịch làm việc của toàn bộ nhân viên.</p>

            <div className="filter-container">
                <label htmlFor="staff-filter">Lọc theo nhân viên:</label>
                <select
                    id="staff-filter"
                    value={selectedStaffName}
                    onChange={(e) => setSelectedStaffName(e.target.value)}
                    className="staff-select"
                    disabled={loading}
                >
                    <option value="">-- Xem Tất Cả --</option>
                    {staffList.map(staff => (
                        <option key={staff.id} value={staff.fullName}>{staff.fullName}</option>
                    ))}
                </select>
            </div>

            <div className="content-box">
                {renderContent()}
            </div>
        </div>
    );
};

export default ManagerSchedulePage;