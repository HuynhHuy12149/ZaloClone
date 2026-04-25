export default class BaseResponse {
  constructor(success, data, message, error = null) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.error = error;
  }
}
