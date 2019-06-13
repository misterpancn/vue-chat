import ws from '@/request/websocket'
import request from '@/request'

const state = {
  allMessage: localStorage.getItem('allMessage') !== null ? JSON.parse(localStorage.getItem('allMessage')) : []
}

const mutations = {
  // 消息推送
  PUSH_MESSAGE (state, message) {
    let sessionList = state.allMessage;
    let res = message.response
    let thisUser = message.thisUser
    if (sessionList && sessionList.length > 0) {
      var isSave = false;
      sessionList.map(function (item) {
        // 一对一
        if (parseInt(res.chat_id) === item.sendTo && !item.isGroup) {
          // 保存到localStorage中消息记录设置不超过 n 条
          if (item.messages.length > 50) {
            item.messages.splice(0, 1)
          }
          let show = ws.messagesTimeShow(res.time, item.lastTime)
          if (show) {
            item.lastTime = res.time
          }
          item.messages.push({
            text: res.data,
            date: res.time,
            self: parseInt(res.uid) === thisUser.userId,
            uid: res.uid,
            user_name: res.user_name,
            showTime: show,
            photo: res.photo,
            type: res.type
          })
          isSave = true
        }
        // 群消息
        if (item.isGroup && parseInt(res.group_id) === item.sendTo) {
          // 保存到localStorage中消息记录设置不超过 n 条
          if (item.messages.length > 50) {
            item.messages.splice(0, 1)
          }
          let show = ws.messagesTimeShow(res.time, item.lastTime)
          if (show) {
            item.lastTime = res.time
          }
          item.messages.push({
            text: res.data,
            date: res.time,
            self: parseInt(res.uid) === thisUser.userId,
            uid: res.uid,
            user_name: res.user_name,
            showTime: show,
            photo: res.photo,
            type: res.type
          })
          isSave = true
        }
      })
      if (isSave === false) {
        sessionList.push({
          sendTo: parseInt(res.chat_id) > 0 ? parseInt(res.chat_id) : parseInt(res.group_id),
          isGroup: res.group_id > 0,
          lastTime: res.time,
          messages: [
            {
              text: res.data,
              date: res.time,
              self: parseInt(res.uid) === thisUser.userId,
              uid: res.uid,
              user_name: res.user_name,
              showTime: true,
              photo: res.photo,
              type: res.type
            }
          ]
        })
      }
    } else {
      sessionList = [
        {
          sendTo: parseInt(res.chat_id) > 0 ? parseInt(res.chat_id) : parseInt(res.group_id),
          isGroup: res.group_id > 0,
          lastTime: res.time,
          messages: [
            {
              text: res.data,
              date: res.time,
              self: parseInt(res.uid) === thisUser.userId,
              uid: res.uid,
              user_name: res.user_name,
              showTime: true,
              photo: res.photo,
              type: res.type
            }
          ]
        }
      ];
    }
    state.allMessage = sessionList;
    localStorage.setItem('allMessage', JSON.stringify(state.allMessage))
  },
  RESET_MESSAGE (state) {
    state.allMessage = [];
  },
  // 将线上历史数据写入到本地
  SET_MESSAGE (state, message) {
    let mes = message.response;
    let users = message.obj.users;
    let sessionList = state.allMessage
    let list = [];
    let lastTime = 0;
    let masterList = {
      sendTo: parseInt(message.obj.selectId),
      isGroup: message.obj.isGroup
    };
    if (mes.length > 0) {
      mes.map((v) => {
        list.push({
          text: v.data,
          date: v.time,
          self: parseInt(v.uid) === users.userId,
          uid: v.uid,
          user_name: v.user_name,
          showTime: true,
          photo: v.photo,
          type: v.type
        })
        lastTime = v.time;
      })
      masterList.messages = list;
      masterList.lastTime = lastTime
    }
    let isSave = false;
    if (sessionList && sessionList.length > 0) {
      sessionList.map((item) => {
        if (item.sendTo === message.obj.selectId && item.isGroup === message.obj.isGroup) {
          item.messages = list;
          item.lastTime = lastTime
          isSave = true;
        }
      })
      if (!isSave) {
        sessionList.push(masterList)
      }
    } else {
      sessionList = []
      sessionList.push(masterList)
    }
    state.allMessage = sessionList;
    localStorage.setItem('allMessage', JSON.stringify(state.allMessage))
  }
}

const actions = {
  pushMessage ({ commit }, message) {
    commit('PUSH_MESSAGE', message)
  },
  deleteMessage ({commit}) {
    commit('RESET_MESSAGE')
  },
  getMessage ({commit}, obj) {
    return new Promise((resolve, reject) => {
      if (obj.selectId > 0 && typeof obj.users === 'object') {
        if (obj.isGroup) {
          request.getGroupMessage(obj.selectId, 50).then((response) => {
            if (response.data.data && response.data.data.length > 0) {
              commit('SET_MESSAGE', {response: response.data.data, obj: obj})
            }
            resolve(response)
          }).catch((e) => { reject(e) })
        } else {
          request.getChatMessage(obj.selectId, 50).then((response) => {
            if (response.data.data && response.data.data.length > 0) {
              commit('SET_MESSAGE', {response: response.data.data, obj: obj})
            }
            resolve(response)
          }).catch((e) => { reject(e) })
        }
      }
    })
  },
  sendChatMes ({commit}, data) {
    return new Promise((resolve, reject) => {
      request.sendChatMessage(data).then((res) => {
        resolve(res)
      }).catch((e) => { reject(e) })
    })
  },
  sendGroupMes ({commit}, data) {
    return new Promise((resolve, reject) => {
      request.sendGroupMessage(data).then((res) => {
        resolve(res)
      }).catch((e) => { reject(e) })
    })
  },
  chatSendRecorder ({commit}, data) {
    return new Promise((resolve, reject) => {
      request.uploadRecorderByChat(data.id, data.form_data, {
        headers: {'Content-Type': 'multipart/form-data'}
      }).then((r) => { resolve(r) }).catch((e) => { reject(e) })
    })
  },
  groupSendRecorder ({commit}, data) {
    return new Promise((resolve, reject) => {
      request.uploadRecorderByGroup(data.id, data.form_data, {
        headers: {'Content-Type': 'multipart/form-data'}
      }).then((r) => { resolve(r) }).catch((e) => { reject(e) })
    })
  }
}

const getters = {
  getAllMessage: state => {
    return state.allMessage
  },
  getMessageLocation: (state) => (selectId, isGroup) => {
    var res = []
    if (selectId === 0) {
      return res;
    }
    if (state.allMessage.length > 0) {
      state.allMessage.map(function (v) {
        if (v.sendTo === selectId && v.isGroup === isGroup) {
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
