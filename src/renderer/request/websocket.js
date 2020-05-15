import config from '@/store/config/config'
import store from '@/store'
var chat = {
  Server: config.serviceAddress,
  url: 'https://' + config.serviceAddress,
  token: config.token,
  // 限制socket链接次数
  overflow: false,
  connectTotal: 0
}
var socket
var transport = config.transport === null ? 'ws://' : 'wss://'
chat.connectWS = function (exception) {
  socket = new WebSocket(transport + config.serviceAddress + ':' + config.websocketPort)
  socket.onopen = onopensocket
  socket.onmessage = onmessage
  socket.onerror = socketError
  socket.onclose = socketClose
  chat.exception = exception
  chat.connectTotal += 1
  if (chat.connectTotal > config.connectLimit) {
    chat.overflow = true
  }
}
function onopensocket () {
  var send = '{"type":"login","uid":"' + store.getters.getUser.userId + '","token":"' + chat.token + '"}'
  console.log('连接服务器成功')
  socket.send(send)
}
function onmessage (mes) {
  if (mes.data.length === 0 || mes.data === '') {
    return false
  }
  var res = chat.evil(mes.data)
  if (typeof res.all_user === 'object' && res.all_user.length > 0) {
    let user = [];
    let groupList = [];
    for (var i = 0; i < res.all_user.length; i++) {
      let c = {
        userId: parseInt(res.all_user[i].id),
        name: res.all_user[i].user_name,
        img: './../../../../static/img/2.png'
      }
      user.push(c)
    }
    if (typeof res.all_group === 'object' && res.all_group.length > 0) {
      groupList = res.all_group;
    }
    store.dispatch('pushMessage', {
      response: res,
      thisUser: store.getters.getUser
    })
    store.dispatch('setUserList', user)
    store.dispatch('setGroupList', groupList)
    console.log(res)
  }
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
chat.sendMessage = function (mes, uid, group) {
  if (mes) {
    mes = mes.replace(/[\r\n]/i, '<br>')
    mes = mes.replace(/"/g, '\\"')
    var data = '{"type":"message","content":"' + mes + '","group":"' + group + '","send_to_uid":"' + uid + '","uid":"' + store.getters.getUser.userId + '"}'
    socket.send(data)
  }
}
chat.messagesTimeShow = function (now, lastTime) {
  let time = new Date(now).getTime()
  let bool = false
  // 每隔3分钟显示消息的时间
  if (time - lastTime > 1000 * 60 * 3) {
    bool = true
  }
  return bool
}
chat.socket = socket
export default chat

