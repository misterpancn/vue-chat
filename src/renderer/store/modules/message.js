import ws from '@/request/websocket'
import request from '@/request'

const state = {
  allMessage: []
}

const fuc = {
  handleMes: function (res, other) {
    return {
      data: res.data,
      time: res.time,
      self: parseInt(res.uid) === other.userId,
      uid: res.uid,
      user_name: res.user_name,
      showTime: other.show,
      photo: res.photo,
      type: res.type,
      mes_id: parseInt(res.group_mes_id) ? parseInt(res.group_mes_id) : parseInt(res.user_mes_id),
      redis_id: res.redis_id,
      is_down: res.is_down,
      save_path: res.save_path
    }
  }
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
          item.messages.push(fuc.handleMes(res, {userId: thisUser.userId, show: show}))
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
          item.messages.push(fuc.handleMes(res, {userId: thisUser.userId, show: show}))
          isSave = true
        }
      })
      if (isSave === false) {
        sessionList.push({
          sendTo: parseInt(res.chat_id) > 0 ? parseInt(res.chat_id) : parseInt(res.group_id),
          isGroup: res.group_id > 0,
          lastTime: res.time,
          messages: [fuc.handleMes(res, {userId: thisUser.userId, show: true})]
        })
      }
    } else {
      sessionList = [
        {
          sendTo: parseInt(res.chat_id) > 0 ? parseInt(res.chat_id) : parseInt(res.group_id),
          isGroup: res.group_id > 0,
          lastTime: res.time,
          messages: [fuc.handleMes(res, {userId: thisUser.userId, show: true})]
        }
      ];
    }
    state.allMessage = sessionList;
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
        list.push(fuc.handleMes(v, {userId: users.userId, show: true}))
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
  },
  UPDATE_MESSAGE_FILE_STATUS (status, data) {
    state.allMessage.map((item) => {
      if (item.sendTo === data.selectId && item.isGroup === data.isGroup) {
        item.messages.map((mes) => {
          if (parseInt(mes.type) === ws.messageType.file &&
            (mes.redis_id === data.redis_id || parseInt(mes.mes_id) === parseInt(data.redis_id))) {
            mes.is_down = 1
            mes.save_path = data.savePath
          }
        })
      }
    })
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
      let getLast = obj.getLast ? 1 : 0;
      if (obj.selectId > 0 && typeof obj.users === 'object') {
        if (obj.isGroup) {
          request.getGroupMessage(obj.selectId, obj.limit, obj.page, getLast).then((response) => {
            if (obj.saveLocal && response.data.data.data && response.data.data.data.length > 0) {
              commit('SET_MESSAGE', {response: response.data.data.data, obj: obj})
            }
            resolve(response)
          }).catch((e) => { reject(e) })
        } else {
          request.getChatMessage(obj.selectId, obj.limit, obj.page, getLast).then((response) => {
            if (obj.saveLocal && response.data.data.data && response.data.data.data.length > 0) {
              commit('SET_MESSAGE', {response: response.data.data.data, obj: obj})
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
  },
  changeFileStatusMes ({commit}, data) {
    commit('UPDATE_MESSAGE_FILE_STATUS', data)
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
