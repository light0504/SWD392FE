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
  PROCESSING: 1, // Đang xử lý
  SHIPPED: 2,    // Đã gửi đi (trong ngữ cảnh spa có thể là "Hoàn thành")
  DELIVERED: 3,  // Đã giao (trong ngữ cảnh spa có thể là "Đã bàn giao pet")
  CANCELLED: 4,  // Đã hủy
};

// Helper để hiển thị text cho người dùng
export const ORDER_STATUS_TEXT = {
    [ORDER_STATUS.PENDING]: 'Đang chờ xử lý',
    [ORDER_STATUS.PROCESSING]: 'Đang thực hiện',
    [ORDER_STATUS.SHIPPED]: 'Đã hoàn thành',
    [ORDER_STATUS.DELIVERED]: 'Đã bàn giao',
    [ORDER_STATUS.CANCELLED]: 'Đã hủy',
};