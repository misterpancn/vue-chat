import axios from '@/request'
const state = {
  // 通知列表
  notifyList: {},
  // 是否显示系统消息栏
  haveNotify: false,
  // 是否选中系统消息栏
  isSelectNotify: false,
  // 消息提醒数
  notifyBadge: 0
}

const mutations = {
  SET_NOTIFY_LIST (state, data) {
    state.notifyList = data
  },
  SET_HAVE_NOTIFY (state, data) {
    state.haveNotify = data
  },
  SET_SELECT_NOTIFY (state, data) {
    state.isSelectNotify = data
  },
  UPDATE_NOTIFY_LIST (state, data) {
    state.notifyList.map((item) => {
      if (item.id === data.id) {
        item.apply_status = data.audit
      }
    })
  },
  INIT_NOTIFY_BADGE (state, data) {
    state.notifyBadge = data
  },
  UP_NOTIFY_BADGE (state) {
    state.notifyBadge += 1
  },
  DESTROY (state) {
    state.notifyList = {};
    state.haveNotify = false;
    state.isSelectNotify = false;
    state.notifyBadge = 0;
  }
}

const actions = {
  initNotifyList ({commit}, data) {
    commit('SET_NOTIFY_LIST', data)
    if (data && data.length > 0) {
      commit('SET_HAVE_NOTIFY', true)
    }
  },
  setNotifyList ({commit}) {
    axios.getApplyList().then((r) => {
      commit('SET_NOTIFY_LIST', r.data.data)
      if (r.data.data && r.data.data.length > 0) {
        commit('SET_HAVE_NOTIFY', true)
      }
    })
  },
  setSelectNotify ({commit}, data) {
    commit('SET_SELECT_NOTIFY', data)
  },
  updateNotifyList ({commit}, data) {
    commit('UPDATE_NOTIFY_LIST', data)
  },
  initNotifyBadge ({commit}, data) {
    if (data) {
      commit('INIT_NOTIFY_BADGE', data.count)
    }
  },
  upNotifyBadge ({commit}) {
    commit('UP_NOTIFY_BADGE')
  },
  destroyNotify ({commit}) {
    commit('DESTROY')
  },
  resetNotifyBadge ({commit}) {
    commit('INIT_NOTIFY_BADGE', 0)
    axios.resetNotifyBadge()
  }
}

const getters = {
  getNotifyList: state => state.notifyList,
  getHaveNotify: state => state.haveNotify,
  getSelectNotify: state => state.isSelectNotify,
  getNotifyBadge: state => state.notifyBadge
}

export default {
  state,
  mutations,
  actions,
  getters
}


