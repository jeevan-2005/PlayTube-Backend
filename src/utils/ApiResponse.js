class ApiResponse {
    constructor(statusCode, data, message = "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode // statusCode < 400 since > 400 is error.
    }
}

export default ApiResponse