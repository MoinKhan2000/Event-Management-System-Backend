export default class ApplicationErrorHandler extends Error {
  constructor(message, code) {
    super(message)
    this.code = code
  }
}