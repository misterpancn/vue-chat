import ws from '@/request/websocket'

const state = {
  allMessage: localStorage.getItem('allMessage') !== null ? JSON.parse(localStorage.getItem('allMessage')) : {}
}

const mutations = {
  PUSH_MESSAGE (state, message) {
    let sessionList = state.allMessage;
    let res = message.response
    let thisUser = message.thisUser
    if (sessionList && sessionList.length > 0) {
      var isSave = false;
      sessionList.map(function (item) {
        if (parseInt(res.send_to_uid) === item.sendTo || parseInt(res.from_uid) === item.sendTo || res.send_to_group === item.sendTo) {
          // 保存到localStorage中消息记录设置不超过 n 条
          if (item.messages.length > 80) {
            item.messages.splice(0, 1)
          }
          let show = ws.messagesTimeShow(res.time, item.lastTime)
          if (show) {
            item.lastTime = new Date(res.time).getTime()
          }
          item.messages.push({
            text: res.content,
            date: res.time,
            self: parseInt(res.from_uid) === thisUser.userId,
            showTime: show
          })
          isSave = true
        }
      })
      if (isSave === false) {
        sessionList.push({
          sendTo: parseInt(res.send_to_uid) > 0 ? parseInt(res.send_to_uid) : res.send_to_group,
          lastTime: new Date(res.time).getTime(),
          messages: [
            {
              text: res.content,
              date: res.time,
              self: parseInt(res.from_uid) === thisUser.userId,
              showTime: true
            }
          ]
        })
      }
    } else {
      sessionList = [
        {
          sendTo: parseInt(res.send_to_uid) > 0 ? parseInt(res.send_to_uid) : res.send_to_group,
          lastTime: new Date(res.time).getTime(),
          messages: [
            {
              text: res.content,
              date: res.time,
              self: parseInt(res.from_uid) === thisUser.userId,
              showTime: true
            }
          ]
        }
      ];
    }
    state.allMessage = sessionList;
    localStorage.setItem('allMessage', JSON.stringify(state.allMessage))
  }
}

const actions = {
  pushMessage ({ commit }, message) {
    console.log(message)
    commit('PUSH_MESSAGE', message)
  }
}

const getters = {
  getAllMessage: state => {
    return state.allMessage
  },
  getMessageLocation: (state) => (selectUserId) => {
    var res = []
    if (state.allMessage.length > 0) {
      state.allMessage.map(function (v) {
        if (v.sendTo === selectUserId) {
          res = v
        }
      })
    }
    return res
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
