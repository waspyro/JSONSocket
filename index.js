import JsonSocket from "./lib/JsonSocket.js";

export default JsonSocket

export function modify(socket, messageDelimiter) {
    return new JsonSocket(socket, messageDelimiter, true).socket
}

export function decorate(socket, messageDelimiter) { //todo add internal EE
    return new JsonSocket(socket, messageDelimiter, false)
}