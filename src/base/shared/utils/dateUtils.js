import moment from 'moment';
import 'moment/locale/vi';

// Thiết lập ngôn ngữ tiếng Việt làm mặc định
moment.locale('vi');

/**
 * Chuyển đổi thời gian sang dạng tương đối (ví dụ: 3 phút trước, 1 giờ trước)
 * @param {string | Date} date - Thời gian cần chuyển đổi
 * @returns {string} - Thời gian tương đối dạng tiếng Việt
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  const relativeTime = moment(date).fromNow();
  return relativeTime.charAt(0).toUpperCase() + relativeTime.slice(1);
};

/**
 * Định dạng thời gian theo kiểu cụ thể (ví dụ: HH:mm, DD/MM/YYYY)
 * @param {string | Date} date 
 * @param {string} format 
 */
export const formatDateTime = (date, format = 'DD/MM/YYYY HH:mm') => {
  if (!date) return '';
  return moment(date).format(format);
};
