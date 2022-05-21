import {InvalidContentLength, BadMessageFormat} from "./Errors.js";

export default class DataFlowHandler {
    #contentLengthExpected = null
    #buffer = ''
    #delimiter
    #listener = () => {}

    constructor(delimiter = '#', listener = () => {}) {
        this.#delimiter = delimiter
        this.#listener = listener
    }

    #reset() {
        this.#contentLengthExpected = null
        this.#buffer = ''
    }

    handleData(newData) {
        this.#buffer += newData
        if(this.#contentLengthExpected === null) {
            const delimiterIndex = this.#buffer.indexOf(this.#delimiter)
            if(delimiterIndex === -1) return //message may be look like so: 2123 + 3423#"asd"
            this.#contentLengthExpected = Number(this.#buffer.substring(0, delimiterIndex))
            if(isNaN(this.#contentLengthExpected)) {
                this.#reset()
                throw new InvalidContentLength(this.#contentLengthExpected, this.#buffer)
            }
            this.#buffer = this.#buffer.substring(delimiterIndex + 1)
        }

        if(this.#contentLengthExpected !== null) {
            const length = Buffer.byteLength(this.#buffer, 'utf8')
            if(length === this.#contentLengthExpected) {
                return this.handleJSONString(this.#buffer)
            } else if(length > this.#contentLengthExpected) {
                const message = this.#buffer.substring(0, this.#contentLengthExpected)
                const rest = this.#buffer.substring(this.#contentLengthExpected)
                this.handleJSONString(message)
                this.handleData(rest)
            }
        }
    }

    handleJSONString(message) {
        this.#reset()
        let jsonMessage
        try { jsonMessage = JSON.parse(message) || {} }
        catch (e) { throw new BadMessageFormat('JSON', [e.message, message]) }
        this.#listener(jsonMessage)
    }

    onMessage(listener) {
        if(typeof listener !== 'function')
            throw new Error('listener argument should be a function type')
        this.#listener = listener
    }

    offMessage() {
        this.#listener = () => {}
    }

    formatMessage(message) {
        const messageData = JSON.stringify(message)
        const length = Buffer.byteLength(messageData, 'utf8')
        return String(length) + this.#delimiter + messageData
    }

}
