import config from '@/store/config/config'
import store from '@/store'
import rec from '@/media/recorder'
import fs from 'fs'
var chat = {
  Server: config.serviceAddress,
  url: (config.openssl === false ? 'http://' : 'https://') + config.serviceAddress,
  // 限制socket链接次数
  overflow: false,
  connectTotal: 0,
  timer: null,
  pingTimer: null,
  callBack: () => {},
  messageType: {
    message: 0,
    notify: 1,
    pong: 2,
    error: 5,
    refresh_token: 6
  }
}
var socket
var transport = config.openssl === false ? 'ws://' : 'wss://'
chat.connectWS = function () {
  if (chat.connectTotal > config.connectLimit) {
    chat.overflow = true
    chat.clearTimer()
    chat.callBack({
      type: 'error',
      mess: '连接服务器失败，请重新登录',
      code: 500
    })
    return false
  }
  socket = new WebSocket(transport + config.serviceAddress + ':' + config.websocketPort)
  socket.onopen = onopensocket
  socket.onmessage = onmessage
  socket.onerror = socketError
  socket.onclose = socketClose
  chat.connectTotal += 1
}
function onopensocket () {
  var send = {
    type: 'login',
    uid: store.getters.getUser.userId,
    token: store.getters.getToken
  }
  console.log('连接服务器成功')
  socket.send(JSON.stringify(send))
  chat.ping()
}
function onmessage (mes) {
  if (mes.data.length === 0 || mes.data === '') {
    return false
  }
  var res = chat.evil(mes.data)
  if (res.type === chat.messageType.error) {
    chat.callBack(res)
    return false
  }
  if (res.type === chat.messageType.notify) {
    chat.callBack(res)
  }
  if (res.type === chat.messageType.refresh_token) {
    chat.callBack(res)
    return false;
  }
  if (res.type === chat.messageType.pong) {
    return false;
  }
  if (res.type === chat.messageType.message) {
    store.dispatch('pushMessage', {
      response: res,
      thisUser: store.getters.getUser
    })
    console.log(res)
  }
}
function socketError () {
  if (store.getters.getIsOnline) {
    console.log('服务器连接错误，定时重连......')
  }
  chat.timerFn()
}
function socketClose () {
  if (store.getters.getIsOnline) {
    console.log('服务器连接已断开，定时重连......')
  }
  chat.timerFn()
}
chat.timerFn = () => {
  if (chat.overflow === false && chat.timer === null && store.getters.getIsOnline) {
    chat.timer = setInterval(chat.connectWS, 3000)
  }
}
chat.ping = () => {
  if (chat.pingTimer === null) {
    chat.pingTimer = setInterval(() => {
      if (socket === undefined) {
        chat.clearTimer()
      } else {
        socket.send(JSON.stringify({
          type: 'ping',
          token: store.getters.getToken
        }))
      }
    }, 1000 * 30)
  }
}
chat.evil = function (fn) {
  // 一个变量指向Function，防止有些前端编译工具报错
  let Fn = Function
  return new Fn('return ' + fn)()
}
chat.sendMessage = function (mes, chatId, groupId) {
  if (mes) {
    mes = mes.replace(/[\r\n]/i, '<br>')
    mes = mes.replace(/"/g, '\\"')
    let chatData = store.getters.getSelectUser(chatId, false)
    var blob = null;
    var buf = fs.readFileSync(`${__dirname}/../../../static/audio/aaa.wav`);
    let base64 = Buffer.from(buf, 'binary').toString('base64');
    console.log(base64)
    let data = {
      type: 'message',
      content: mes,
      group_id: groupId,
      chat_id: chatId,
      send_to_uid: chatData.id,
      user_name: store.getters.getUser.name,
      photo: store.getters.getUser.photo
    }
    if (chatId > 0) {
      store.dispatch('pushMessage', {
        thisUser: store.getters.getUser,
        response: {
          type: chat.messageType.message,
          data: mes,
          time: parseInt((new Date()) / 1000),
          chat_id: chatId,
          uid: store.getters.getUser.userId,
          user_name: store.getters.getUser.name,
          photo: store.getters.getUser.photo
        }
      })
    }
    if (blob) {
      rec.blobToBase64(blob, (base64) => {
        data.base64 = base64
        if (socket === undefined) {
          chat.callBack({
            type: chat.messageType.error,
            content: 'WebSocket is already in closed state.'
          })
        } else {
          socket.send(JSON.stringify(data))
        }
      })
    } else {
      if (socket === undefined) {
        chat.callBack({
          type: chat.messageType.error,
          content: 'WebSocket is already in closed state.'
        })
      } else {
        socket.send(JSON.stringify(data))
      }
    }
  }
}
chat.messagesTimeShow = function (now, lastTime) {
  let bool = false
  // 每隔3分钟显示消息的时间
  if (now - lastTime > 60 * 3) {
    bool = true
  }
  return bool
}
chat.tryConnect = (callback) => {
  chat.callBack = callback;
  chat.connectWS()
}
chat.init = (callback) => {
  chat.callBack = callback
}
chat.closeConnect = () => {
  if (socket !== undefined) {
    socket.close()
  }
  chat.clearTimer()
}
chat.clearTimer = () => {
  clearInterval(chat.pingTimer)
  chat.pingTimer = null
  clearInterval(chat.timer)
  chat.timer = null
}
chat.socket = socket
export default chat

