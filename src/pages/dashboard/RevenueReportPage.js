import React, { useEffect, useState, useMemo } from 'react';
import { getAllOrder } from '../../api/orderAPI';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './DashboardPages.css';
import './RevenueReportPage.css';

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- Hằng số và hàm tiện ích ---
const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const RevenueReportPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeFilter, setTimeFilter] = useState('last7days'); // 'today', 'last7days', 'last30days'

    useEffect(() => {
        const fetchAllOrders = async () => {
            setLoading(true);
            try {
                const response = await getAllOrder();
                if (response.isSuccess) {
                    const completedOrders = response.data.filter(order => order.status === 2); // Chỉ tính đơn hàng đã hoàn thành
                    setOrders(completedOrders);
                } else {
                    throw new Error(response.message || "Không thể tải dữ liệu đơn hàng.");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAllOrders();
    }, []);

    // Lọc và xử lý dữ liệu dựa trên bộ lọc thời gian
    const processedData = useMemo(() => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const filtered = orders.filter(order => {
            const orderDate = new Date(order.orderDate);
            if (timeFilter === 'today') {
                return orderDate >= startOfToday;
            }
            if (timeFilter === 'last7days') {
                const sevenDaysAgo = new Date(startOfToday);
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
                return orderDate >= sevenDaysAgo;
            }
            if (timeFilter === 'last30days') {
                const thirtyDaysAgo = new Date(startOfToday);
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
                return orderDate >= thirtyDaysAgo;
            }
            return true;
        });

        const serviceOrders = filtered.filter(o => o.orderDetails && o.orderDetails.length > 0);
        const membershipOrders = filtered.filter(o => !o.orderDetails || o.orderDetails.length === 0);
        const totalRevenue = filtered.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
        const serviceRevenue = serviceOrders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
        const membershipRevenue = membershipOrders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

        return {
            filteredOrders: filtered,
            totalRevenue,
            serviceRevenue,
            membershipRevenue,
            totalOrders: filtered.length,
        };
    }, [orders, timeFilter]);

    // Chuẩn bị dữ liệu cho biểu đồ
    const chartData = useMemo(() => {
        const labels = [];
        const serviceData = [];
        const membershipData = [];
        const dateMap = new Map();

        if (processedData.filteredOrders.length > 0) {
            processedData.filteredOrders.forEach(order => {
                const dateLabel = formatDate(order.orderDate);
                if (!dateMap.has(dateLabel)) {
                    dateMap.set(dateLabel, { service: 0, membership: 0 });
                }
                const price = Number(order.totalPrice) || 0;
                const isServiceOrder = order.orderDetails && order.orderDetails.length > 0;
                if (isServiceOrder) {
                    dateMap.get(dateLabel).service += price;
                } else {
                    dateMap.get(dateLabel).membership += price;
                }
            });
        
            const sortedDates = [...dateMap.keys()].sort((a, b) => {
                const [dayA, monthA, yearA] = a.split('/');
                const [dayB, monthB, yearB] = b.split('/');
                return new Date(`${yearA}-${monthA}-${dayA}`) - new Date(`${yearB}-${monthB}-${dayB}`);
            });

            sortedDates.forEach(date => {
                labels.push(date);
                serviceData.push(dateMap.get(date).service);
                membershipData.push(dateMap.get(date).membership);
            });
        }

        return {
            labels,
            datasets: [
                { label: 'Doanh thu Dịch vụ', data: serviceData, backgroundColor: 'rgba(54, 162, 235, 0.7)' },
                { label: 'Doanh thu Thành viên', data: membershipData, backgroundColor: 'rgba(75, 192, 192, 0.7)' },
            ]
        };
    }, [processedData.filteredOrders]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
            legend: { position: 'top' }, 
            title: { display: true, text: 'Biểu đồ Doanh thu' } 
        },
        scales: { 
            x: { stacked: true }, 
            y: { 
                stacked: true, 
                ticks: { 
                    callback: (value) => {
                        if (typeof value === 'number') return formatCurrency(value);
                        return value;
                    }
                } 
            } 
        }
    };

    if (loading) return <div className="loading-spinner"></div>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="dashboard-page">
            <h1 className="page-title">Báo Cáo Doanh Thu</h1>
            <p className="page-subtitle">Tổng quan về tình hình kinh doanh của cửa hàng.</p>
            
            <div className="page-controls">
                <div className="time-filter-group">
                    <button onClick={() => setTimeFilter('today')} className={timeFilter === 'today' ? 'active' : ''}>Hôm Nay</button>
                    <button onClick={() => setTimeFilter('last7days')} className={timeFilter === 'last7days' ? 'active' : ''}>7 Ngày Qua</button>
                    <button onClick={() => setTimeFilter('last30days')} className={timeFilter === 'last30days' ? 'active' : ''}>30 Ngày Qua</button>
                </div>
            </div>

            <div className="summary-cards">
                <div className="summary-card">
                    <h4>Tổng Doanh Thu</h4>
                    <p>{formatCurrency(processedData.totalRevenue)}</p>
                </div>
                <div className="summary-card">
                    <h4>DT Dịch Vụ</h4>
                    <p>{formatCurrency(processedData.serviceRevenue)}</p>
                </div>
                <div className="summary-card">
                    <h4>DT Thành Viên</h4>
                    <p>{formatCurrency(processedData.membershipRevenue)}</p>
                </div>
                <div className="summary-card">
                    <h4>Tổng Đơn Hàng</h4>
                    <p>{processedData.totalOrders}</p>
                </div>
            </div>
            
            <div className="content-box chart-container">
                {chartData.labels.length > 0 ? (
                    <Bar options={chartOptions} data={chartData} />
                ) : (
                    <p className="empty-message">Không có dữ liệu doanh thu để hiển thị.</p>
                )}
            </div>

            <div className="content-box">
                <h3>Chi tiết Giao dịch</h3>
                <div className="table-wrapper">
                    <table className="revenue-table">
                        <thead>
                            <tr>
                                <th>Mã ĐH</th>
                                <th>Ngày</th>
                                <th>Loại</th>
                                <th>Tổng Tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {processedData.filteredOrders.map(order => (
                                <tr key={order.id}>
                                    <td>{order.id.substring(0, 8)}</td>
                                    <td>{formatDate(order.orderDate)}</td>
                                    <td>{order.orderDetails.length > 0 ? 'Dịch vụ' : 'Thành viên'}</td>
                                    <td className="order-total">{formatCurrency(order.totalPrice)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RevenueReportPage;