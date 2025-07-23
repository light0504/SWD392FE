export const GENDER = {
  OTHER: 0,
  MALE: 1,
  FEMALE: 2,
};

export const MEMBERSHIP_TYPE = {
  BRONZE: 0,
  SILVER: 1,
  GOLD: 2,
  PLATINUM: 3,
};
export const ORDER_STATUS = {
  PENDING: 0,    // Đang chờ
  PAID: 1,    // Đã gửi đi 
  PROCESSING: 2, // Đang xử lý
  COMPLETED: 3,  // Đã giao 
  CANCELLED: 4,  // Đã hủy
};

// Helper để hiển thị text cho người dùng
export const ORDER_STATUS_TEXT = {
    [ORDER_STATUS.PENDING]: 'Đang chờ xử lý',
    [ORDER_STATUS.PAID]: 'Đã thanh toán',
    [ORDER_STATUS.SHIPPED]: 'Đã hoàn thành',
    [ORDER_STATUS.COMPLETED]: 'Đã bàn giao',
    [ORDER_STATUS.CANCELLED]: 'Đã hủy',
};

