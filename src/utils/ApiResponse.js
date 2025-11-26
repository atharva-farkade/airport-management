class ApiResponse {
    constructor(statusCode, data = null, message = "Success") {
        this.statusCode = statusCode; // HTTP status code
        this.message = message; // Response message
        this.data = data; // Optional data payload
        this.success = statusCode< 400; // Success flag based on status code, try keep it below 400 for safety
    }
}

export {ApiResponse}