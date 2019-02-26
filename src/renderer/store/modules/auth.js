import ws from '@/request/websocket'
import request from '@/request'

const state = {
  user: localStorage.getItem('user') !== null ? JSON.parse(localStorage.getItem('user')) : {},
  userList: localStorage.getItem('userList') !== null ? JSON.parse(localStorage.getItem('userList')) : {},
  groupList: localStorage.getItem('groupList') !== null ? JSON.parse(localStorage.getItem('groupList')) : {}
}

const mutations = {
  SET_USER (state, user) {
    state.user = user;
    localStorage.setItem('user', JSON.stringify(state.user))
  },
  SET_USER_LIST (state, userList) {
    state.userList = userList;
    localStorage.setItem('userList', JSON.stringify(state.userList))
  },
  SET_GROUP_LIST (state, groupList) {
    state.groupList = groupList;
    localStorage.setItem('groupList', JSON.stringify(state.groupList))
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
        if (response.status === 200 && response.data.mess === 'success') {
          commit('SET_USER', {
            userId: parseInt(response.data.user_id),
            name: response.data.name,
            img: response.data.img
          })
        }
        resolve(response)
      }).catch((error) => {
        reject(error)
      })
    })
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
      if (v.group_name) {
        allUser.push({
          userId: 0,
          name: v.group_name,
          img: ws.url + v.img,
          isGroup: true
        })
      } else if (v.userId !== state.user.userId) {
        allUser.push(v)
      }
    })
    return allUser
  },
  getSelectUser: (state) => (id) => {
    var res = {}
    if (!isNaN(id)) {
      for (let i = 0; i < state.userList.length; i++) {
        if (state.userList[i].userId === id) {
          res = state.userList[i]
          break
        }
      }
    } else {
      for (let i = 0; i < state.groupList.length; i++) {
        if (state.groupList[i].group_name === id) {
          res = state.groupList[i]
          break
        }
      }
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
