import config from '@/store/config/config'
import store from '@/store'
var chat = {
  Server: config.serviceAddress,
  url: (config.openssl === false ? 'http://' : 'https://') + config.serviceAddress,
  // 限制socket链接次数
  overflow: false,
  connectTotal: 0,
  timer: null,
  pingTimer: null,
  callBack: () => {},
  httpCallBack: () => {},
  messageType: {
    message: 0,
    notify: 1,
    pong: 2,
    connect: 3,
    error: 5,
    refresh_token: 6,
    audio: 7,
    apply_notify: 8,
    release_friend_list: 9
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
  /* var send = {
    type: 'login',
    uid: store.getters.getUser.userId,
    token: store.getters.getToken
  } */
  console.log('连接服务器成功')
  // socket.send(JSON.stringify(send))
  chat.ping()
}
function onmessage (mes) {
  if (mes.data.length === 0 || mes.data === '') {
    return false
  }
  var res = chat.evil(mes.data)
  if (res.type === chat.messageType.connect) {
    chat.connectInit(res)
    return false;
  }
  if (res.type === chat.messageType.pong) {
    return false;
  }
  chat.callBack(res)
}
function socketError () {
  store.dispatch('chatConnectClose')
  if (store.getters.getIsOnline) {
    console.log('服务器连接错误，定时重连......')
  }
  chat.timerFn()
}
function socketClose () {
  // store.dispatch('chatConnectClose')
}
chat.timerFn = () => {
  if (chat.overflow === false && chat.timer === null && store.getters.getIsOnline) {
    chat.timer = setInterval(chat.connectWS, 3000)
  }
}
chat.ping = () => {
  if (chat.pingTimer === null) {
    chat.pingTimer = setInterval(() => {
      if (chat.isClose()) {
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
chat.messagesTimeShow = function (now, lastTime) {
  let bool = false
  // 每隔3分钟显示消息的时间
  if (now - lastTime > 60 * 3) {
    bool = true
  }
  return bool
}
chat.connectInit = (res) => {
  store.dispatch('setConnectId', res.data)
  store.dispatch('initChat', {
    'connect_id': res.data
  }).then((r) => {
    chat.httpCallBack(r)
  }).catch((e) => {
    chat.httpCallBack(e)
  })
}
chat.init = (callback, httpCallback) => {
  chat.callBack = callback
  chat.httpCallBack = httpCallback
}
chat.closeConnect = () => {
  if (!chat.isClose()) {
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
chat.localPush = function (con, chatId, groupId) {
  if (!chat.isClose()) {
    store.dispatch('pushMessage', {
      thisUser: store.getters.getUser,
      response: {
        type: chat.messageType.message,
        data: con,
        time: parseInt((new Date()) / 1000),
        chat_id: chatId,
        group_id: groupId,
        uid: store.getters.getUser.userId,
        user_name: store.getters.getUser.name,
        photo: store.getters.getUser.photo
      }
    })
  } else {
    chat.callBack({
      type: chat.messageType.error,
      content: 'WebSocket is already in closed state.'
    })
  }
}
chat.isClose = function () {
  if (socket.readyState === socket.CLOSED || socket.readyState === socket.CLOSING) {
    return true;
  } else {
    return false;
  }
}
chat.socket = socket
export default chat

