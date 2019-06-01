import axios from '@/request'
const state = {
  modalStatus: false,
  userInfo: {},
  // 搜索key
  search: '',
  // chat_id or group id
  selectId: 0,
  isGroup: false,
  connectId: '',
  badge: []
}

const mutations = {
  SET_MODAL_STATUS (state, data) {
    state.modalStatus = data
  },
  SET_USER_INFO (state, data) {
    state.userInfo = data
  },
  SET_SEARCH (state, data) {
    state.search = data
  },
  SET_SELECT_ID (state, data) {
    state.selectId = data
  },
  SET_IS_GROUP (state, data) {
    state.isGroup = data
  },
  SET_CONNECT_ID (state, data) {
    state.connectId = data
    localStorage.setItem('connect_id', data)
  },
  DESTROY (state) {
    state.modalStatus = false;
    state.userInfo = {};
    state.search = '';
    state.selectId = 0;
    state.isGroup = false;
    state.connectId = '';
  },
  SET_BADGE (state, data) {
    if (state.badge.length === 0) {
      state.badge.push({
        id: data.id,
        is_group: data.is_group,
        count: 1
      })
    } else {
      state.badge.map((item) => {
        if (item.id === data.id && item.is_group === data.is_group) {
          item.count = item.count + 1;
        } else {
          state.badge.push({
            id: data.id,
            is_group: data.is_group,
            count: 1
          })
        }
      })
    }
  },
  RESET_BADGE (state, data) {
    if (state.badge.length > 0) {
      state.badge.map((item) => {
        if (item.id === data.id && item.is_group === data.is_group) {
          item.count = 0;
        }
      })
    }
  },
  INIT_BADGE (state, data) {
    state.badge = data
  }
}

const actions = {
  setUserInfo ({commit}, uid) {
    axios.getUserInfo(uid).then((response) => {
      console.log(response)
      if (response.status === 200) {
        commit('SET_MODAL_STATUS', true)
        commit('SET_USER_INFO', response.data.data)
      }
    })
  },
  setModalStatus ({commit}, status) {
    commit('SET_MODAL_STATUS', status)
  },
  setSearch ({commit}, search) {
    commit('SET_SEARCH', search)
  },
  setSelectId ({commit}, selectId) {
    commit('SET_SELECT_ID', selectId)
  },
  setIsGroup ({commit}, isGroup) {
    commit('SET_IS_GROUP', isGroup)
  },
  setConnectId ({commit}, connectId) {
    commit('SET_CONNECT_ID', connectId)
  },
  chatDataDestroy ({commit}) {
    commit('DESTROY')
  },
  initChat ({commit}, data) {
    return new Promise((resolve, reject) => {
      axios.initChat(data).then((res) => {
        resolve(res)
      }).catch((e) => { reject(e) });
    })
  },
  chatConnectClose () {
    return new Promise((resolve, reject) => {
      axios.chatConnectClose().then((res) => {
        resolve(res)
      }).catch((e) => { reject(e) });
    })
  },
  setBadge ({commit}, data) {
    commit('SET_BADGE', data)
  },
  resetBadge ({commit}, data) {
    commit('RESET_BADGE', data)
    return new Promise((resolve, reject) => {
      axios.resetBadge(data).then((res) => {
        resolve(res)
      }).catch((e) => { reject(e) });
    })
  },
  initBadge ({commit}, data) {
    commit('INIT_BADGE', data)
  }
}

const getters = {
  getModalStatus: state => {
    return state.modalStatus
  },
  getUserInfo: state => {
    return state.userInfo
  },
  search: state => {
    return state.search
  },
  selectId: state => {
    return state.selectId
  },
  isGroup: state => {
    return state.isGroup
  },
  connectId: state => {
    return state.connectId
  },
  getBadgeCount: (state) => (id, isGroup) => {
    let count = 0;
    if (state.badge.length > 0) {
      state.badge.map((item) => {
        if (item.id === id && item.is_group === isGroup) {
          count = item.count
        }
      })
    }
    return count
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}


