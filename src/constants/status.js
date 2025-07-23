// Ánh xạ cho OrderDetailStatus từ backend
export const ORDER_DETAIL_STATUS_MAP = {
    0: { text: 'Chờ xử lý', class: 'pending' },
    1: { text: 'Đã xác nhận', class: 'confirmed' },
    2: { text: 'Đang thực hiện', class: 'in-progress' },
    3: { text: 'Hoàn thành', class: 'completed' },
    4: { text: 'Đã hủy', class: 'cancelled' },
};

// Ánh xạ cho OrderStatus từ backend
export const ORDER_STATUS_MAP = {
    0: { text: 'Chờ xử lý', class: 'pending' },
    1: { text: 'Đang xử lý', class: 'processing' },
    2: { text: 'Hoàn thành', class: 'done' },
    3: { text: 'Đã hủy', class: 'cancelled' },
    4: { text: 'Đã thanh toán', class: 'paid' },
};

// Hàm tiện ích để lấy thông tin trạng thái của OrderDetail
export const getOrderDetailStatusInfo = (status) => {
    return ORDER_DETAIL_STATUS_MAP[status] || { text: 'Không rõ', class: 'unknown' };
};

// Hàm tiện ích để lấy thông tin trạng thái của Order
export const getOrderStatusInfo = (status) => {
    return ORDER_STATUS_MAP[status] || { text: 'Không rõ', class: 'unknown' };
};