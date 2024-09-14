export default class ResponseHandler {
  constructor(statusCode, message, data = null, success = true) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = success;
  }

  sendResponse(res) {
    res.status(this.statusCode).json({
      statusCode: this.statusCode,
      message: this.message,
      success: this.success,
      data: this.data
    });
  }
}
