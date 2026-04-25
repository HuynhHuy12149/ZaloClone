import BaseResponse from './BaseResponse';

// Hàm bọc chuẩn cho mọi query Supabase
export const supabaseProxy = async (supabasePromise) => {
  try {
    const { data, error } = await supabasePromise;
    if (error) {
      console.error('Supabase Error:', error.message);
      return new BaseResponse(false, null, error.message, error);
    }
    return new BaseResponse(true, data, 'Success', null);
  } catch (err) {
    console.error('System Error:', err);
    return new BaseResponse(false, null, 'An unexpected error occurred', err);
  }
};
