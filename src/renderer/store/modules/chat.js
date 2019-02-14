import store from './store'
import config from './../config/config'
let saveData = store.fetch()
var chat = {
  Server: config.serviceAddress,
  url: 'https://' + config.serviceAddress,
  // 登录用户信息
  user: saveData.user,
  token: '12321321',
  // 限制socket链接次数
  overflow: false,
  connectTotal: 0
}
var socket
chat.connectWS = function (callback, exception) {
  socket = new WebSocket('wss://' + chat.Server + ':' + config.websocketPort)
  socket.onopen = onopensocket
  socket.onmessage = onmessage
  socket.onerror = socketError
  socket.onclose = socketClose
  chat.exception = exception
  chat.func = callback
  chat.connectTotal += 1
  if (chat.connectTotal > config.connectLimit) {
    chat.overflow = true
  }
}
function onopensocket () {
  console.log(chat.user)
  var send = '{"type":"login","uid":"' + chat.user.userId + '","token":"' + chat.token + '"}'
  console.log('连接服务器成功')
  socket.send(send)
}
function onmessage (mes) {
  if (mes.data.length === 0 || mes.data === '') {
    return false
  }
  var data = chat.evil(mes.data)
  chat.func(data) // 回调给组件
}
function socketError () {
  console.log('服务器连接出错，定时重连......')
  if (chat.overflow === false) { // 防止过多请求导致内存消耗
    setTimeout(chat.connectWS, 5000)
  } else {
    chat.exception({
      type: 'error',
      mess: '连接服务器失败，请重新登录',
      code: 500
    })
  }
}
function socketClose () {
  console.log('服务器连接已断开，定时重连......')
  if (chat.overflow === false) {
    setTimeout(chat.connectWS, 5000)
  } else {
    chat.exception({
      type: 'error',
      mess: '连接服务器失败，请重新登录',
      code: 500
    })
  }
}
chat.evil = function (fn) {
  // 一个变量指向Function，防止有些前端编译工具报错
  let Fn = Function
  return new Fn('return ' + fn)()
}
chat.getUserInfo = function (id, userList, groupList) {
  var res = {}
  if (!isNaN(id)) {
    for (let i = 0; i < userList.length; i++) {
      if (userList[i].userId === id) {
        res = userList[i]
        break
      }
    }
  } else {
    for (let i = 0; i < groupList.length; i++) {
      if (groupList[i].group_name === id) {
        res = groupList[i]
        break
      }
    }
  }
  return res
}
chat.sendMessage = function (mes, uid, group) {
  if (mes) {
    mes = mes.replace(/[\r\n]/i, '<br>')
    mes = mes.replace(/"/g, '\\"')
    var data = '{"type":"message","content":"' + mes + '","group":"' + group + '","send_to_uid":"' + uid + '","uid":"' + chat.user.userId + '"}'
    socket.send(data)
  }
}
chat.socket = socket
export default chat
