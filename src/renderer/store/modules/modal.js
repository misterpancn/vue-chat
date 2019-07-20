const state = {
  editInfoShow: false,
  userInfoShow: false,
  addToShow: false,
  changePwdShow: false,
  modifyAvatarShow: false,
  messageHistoryShow: false,
  groupUserShow: false
}

const mutations = {
  SET_EDIT_INFO_SHOW (state, data) {
    state.editInfoShow = data
  },
  SET_USER_INFO_SHOW (state, data) {
    state.userInfoShow = data
  },
  SET_ADD_TO_SHOW (state, data) {
    state.addToShow = data
  },
  SET_CHANGE_PWD_SHOW (state, data) {
    state.changePwdShow = data
  },
  SET_MODIFY_AVATAR_SHOW (state, data) {
    state.modifyAvatarShow = data
  },
  SET_MESSAGE_HISTORY (state, data) {
    state.messageHistoryShow = data
  },
  SET_GROUP_USER_SHOW (state, data) {
    state.groupUserShow = data
  },
  DESTROY (state) {
    state.editInfoShow = false
    state.addToShow = false
    state.userInfoShow = false
    state.changePwdShow = false
    state.modifyAvatarShow = false
    state.messageHistoryShow = false
    state.groupUserShow = false
  }
}

const actions = {
  upEditInfoShow ({commit}, data) {
    commit('SET_EDIT_INFO_SHOW', data)
  },
  upUserInfoShow ({commit}, data) {
    commit('SET_USER_INFO_SHOW', data)
  },
  upAddToShow ({commit}, data) {
    commit('SET_ADD_TO_SHOW', data)
  },
  destroyModalStatus ({commit}) {
    commit('DESTROY')
  },
  setChangePwdShow ({commit}, data) {
    commit('SET_CHANGE_PWD_SHOW', data)
  },
  setModifyAvatarShow ({commit}, data) {
    commit('SET_MODIFY_AVATAR_SHOW', data)
  },
  setMessageHistory ({commit}, data) {
    commit('SET_MESSAGE_HISTORY', data)
  },
  setGroupUserShow ({commit}, data) {
    commit('SET_GROUP_USER_SHOW', data)
  }
}

const getters = {
  getEditInfoShow: state => state.editInfoShow,
  getUserInfoShow: state => state.userInfoShow,
  getAddToShow: state => state.addToShow,
  getChangePwdShow: state => state.changePwdShow,
  getModifyAvatarShow: state => state.modifyAvatarShow,
  getMessageHistoryShow: state => state.messageHistoryShow,
  getGroupUserShow: state => state.groupUserShow
}

export default {
  state,
  mutations,
  actions,
  getters
}
