import DataFlowHandler from "./DataFlow.js";

export default class JSONSocket {

    flow = new DataFlowHandler()

    constructor(socket, delimiter = '#', modifyOriginal) {
        this.socket = socket
        this.isClosed = false
        this.flow.setDelimiter(delimiter)

        socket.on('data', this.flow.handleData.bind(this.flow))
        socket.on('connect', () => this.isClosed = false)
        socket.on('close', () => this.isClosed = true)
        socket.on('error', () => this.isClosed = true)

        if(modifyOriginal) {
            socket.sendMessage = this.sendMessage.bind(this)
            socket.sendEndMessage = this.sendEndMessage.bind(this)
            this.flow.onMessage(this.socket.emit.bind(this.socket, 'message'))
        }
    }

    sendMessage(message, cb) {
        if(!this.isClosed)
            this.socket.write(this.flow.formatMessage(message), 'utf8', cb)
        else if(cb)
            cb(new Error('socket is closed'))
    }

    sendEndMessage(message, cb) {
        this.sendMessage(message, err => {
            this.socket.end()
            cb && cb(err)
        })
    }

    on = this.flow.onMessage.bind(this.flow)

    off = this.flow.offMessage.bind(this.flow)

    static modify(socket, delimiter) {
        return new JSONSocket(socket, delimiter, true).socket
    }

    static decorate(socket, delimiter) {
        return new JSONSocket(socket, delimiter, false)
    }

}
