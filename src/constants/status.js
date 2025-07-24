// Ánh xạ cho OrderDetailStatus từ backend
export const ORDER_DETAIL_STATUS_MAP = {
    0: { text: 'Chờ xử lý', class: 'pending' },
    1: { text: 'Đang thực hiện', class: 'in-progress' },
    2: { text: 'Hoàn thành', class: 'completed' },
    3: { text: 'Đã hủy', class: 'cancelled' },
};

// Ánh xạ cho OrderStatus từ backend
export const ORDER_STATUS_MAP = {
    0: { text: 'Chờ xử lý', class: 'pending' },
    1: { text: 'Đang thực hiện', class: 'processing' },
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


export const GENDER_MAP = {
  0: { text: 'Khác'},
  1: { text: 'Nam'},
  2: { text: 'Nữ'}
};

export const getGenderText = (gender) => {
    return GENDER_MAP[gender]?.text || 'Không rõ';
}

export const MEMBERSHIP_TYPE = {
  BRONZE: 0,
  SILVER: 1,
  GOLD: 2,
  PLATINUM: 3,
};