export class JsonSocketError extends Error {
    constructor(message, code, context) {
        super();
        this.code = code
        this.context = context
    }
}

export class BadMessageFormat extends JsonSocketError {
    constructor(expectedFormat, context) {
        const message = 'Error while parsing message' + expectedFormat ? ' as ' + expectedFormat : ''
        const code = 'E_INVALID_FORMAT'
        super(message, code, context);
    }
}

export class InvalidContentLength extends JsonSocketError {
    constructor(got, buffer) {
        const message = 'Invalid content length'
        const context = [got, buffer]
        const code = 'E_INVALID_CONTENT_LENGTH'
        super(message, code, context);
    }
}