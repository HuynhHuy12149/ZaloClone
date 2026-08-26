import Toast from 'react-native-toast-message';

export const showToast = {
  success: (title, message = '') => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message || undefined,
      position: 'top',
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 50,
    });
  },
  error: (title, message = '') => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message || undefined,
      position: 'top',
      visibilityTime: 3500,
      autoHide: true,
      topOffset: 50,
    });
  },
  info: (title, message = '') => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message || undefined,
      position: 'top',
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 50,
    });
  },
  hide: () => {
    Toast.hide();
  },
};

export default showToast;
