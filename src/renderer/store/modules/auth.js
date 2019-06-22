import ws from '@/request/websocket'
import request from '@/request'
import rec from '@/media/recorder'

const state = {
  user: localStorage.getItem('user') !== null ? JSON.parse(localStorage.getItem('user')) : {},
  userList: localStorage.getItem('userList') !== null ? JSON.parse(localStorage.getItem('userList')) : {},
  groupList: localStorage.getItem('groupList') !== null ? JSON.parse(localStorage.getItem('groupList')) : {},
  token: localStorage.getItem('token') !== null ? localStorage.getItem('token') : '',
  tokenType: localStorage.getItem('tokenType') !== null ? localStorage.getItem('tokenType') : '',
  isOnline: false
}

const mutations = {
  SET_USER (state, user) {
    state.user = user;
    state.isOnline = true;
    localStorage.setItem('user', JSON.stringify(state.user))
  },
  SET_USER_LIST (state, userList) {
    state.userList = userList;
    localStorage.setItem('userList', JSON.stringify(state.userList))
  },
  SET_GROUP_LIST (state, groupList) {
    state.groupList = groupList;
    localStorage.setItem('groupList', JSON.stringify(state.groupList))
  },
  SET_TOKEN (state, token) {
    state.token = token.token;
    state.tokenType = token.type;
    localStorage.setItem('token', state.token)
    localStorage.setItem('tokenType', state.tokenType)
  },
  LOGOUT (state) {
    state.userList = {};
    state.userList = {};
    state.groupList = {};
    state.token = '';
    state.tokenType = '';
    state.isOnline = false;
    localStorage.clear()
    ws.closeConnect()
    ws.overflow = true
    rec.closeAudio()
  },
  SET_USER_STATUS (state, data) {
    state.userList.map((item) => {
      if (item.id === data.uid) {
        item.is_online = data.online
      }
    })
    localStorage.setItem('userList', JSON.stringify(state.userList))
  }
}

const actions = {
  setUser ({ commit }, user) {
    commit('SET_USER', user)
  },
  setUserList ({ commit }, userList) {
    commit('SET_USER_LIST', userList)
  },
  setGroupList ({ commit }, groupList) {
    commit('SET_GROUP_LIST', groupList)
  },
  login ({ commit }, data) {
    return new Promise((resolve, reject) => {
      request.login(data).then((response) => {
        if (response.data.status_code === 200) {
          commit('SET_USER', {
            userId: parseInt(response.data.data.users.id),
            name: response.data.data.users.name,
            photo: response.data.data.users.photo
          })
          commit('SET_TOKEN', {
            token: response.data.data.access_token,
            type: response.data.data.token_type
          })
          commit('SET_USER_LIST', response.data.data.friend_list)
          commit('SET_GROUP_LIST', response.data.data.group_list)
        }
        resolve(response)
      }).catch((error) => {
        reject(error)
      })
    })
  },
  register ({ commit }, data) {
    return new Promise((resolve, reject) => {
      request.register(data).then((response) => {
        resolve(response)
      }).catch((error) => {
        reject(error)
      })
    })
  },
  logout ({ commit }, data) {
    return new Promise((resolve, reject) => {
      request.logout(data).then((response) => {
        if (response.data.status_code === 200 || response.data.status_code === 401) {
          commit('LOGOUT')
        }
        resolve(response)
      }).catch((error) => {
        reject(error)
      })
    })
  },
  setToken ({ commit }, data) {
    commit('SET_TOKEN', data)
  },
  setUserStatus ({commit}, data) {
    commit('SET_USER_STATUS', data)
  },
  getFriendsList ({commit}, isGroup) {
    if (isGroup) {
      request.getGroupList().then((r) => {
        if (r.data.data) {
          commit('SET_GROUP_LIST', r.data.data)
        }
      })
    } else {
      request.getFriendList().then((r) => {
        if (r.data.data) {
          commit('SET_USER_LIST', r.data.data)
        }
      })
    }
  }
}


const getters = {
  getUser: state => {
    return state.user
  },
  getUserList: state => {
    return state.userList
  },
  getGroupList: state => {
    return state.groupList
  },
  getIsOnline: state => {
    return state.isOnline
  },
  searchUser: (state) => (sear) => {
    let res = []
    if (state.userList && state.userList.length > 0) {
      res = state.userList.filter(item => item.name.indexOf(sear) > -1)
    }
    if (state.groupList && state.groupList.length > 0) {
      res = res.concat(state.groupList.filter(item => item.group_name.indexOf(sear) > -1))
    }
    if (res.length === 0) {
      return []
    }
    let allUser = []
    res.map(function (v) {
      allUser.push(v)
    })
    return allUser
  },
  getSelectUser: (state) => (id, isGroup) => {
    var res = {}
    if (!isGroup) {
      for (let i = 0; i < state.userList.length; i++) {
        if (state.userList[i].chat_id === id) {
          res = state.userList[i]
          break
        }
      }
    } else {
      for (let i = 0; i < state.groupList.length; i++) {
        if (state.groupList[i].group_id === id) {
          res = state.groupList[i]
          break
        }
      }
    }
    return res
  },
  getToken: (state) => {
    return state.tokenType + ' ' + state.token
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
