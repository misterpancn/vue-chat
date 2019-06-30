const state = {
  editInfoShow: false,
  userInfoShow: false,
  addToShow: false,
  changePwdShow: false,
  modifyAvatarShow: false
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
  DESTROY (state) {
    state.editInfoShow = false
    state.addToShow = false
    state.userInfoShow = false
    state.changePwdShow = false
    state.modifyAvatarShow = false
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
  }
}

const getters = {
  getEditInfoShow: state => state.editInfoShow,
  getUserInfoShow: state => state.userInfoShow,
  getAddToShow: state => state.addToShow,
  getChangePwdShow: state => state.changePwdShow,
  getModifyAvatarShow: state => state.modifyAvatarShow
}

export default {
  state,
  mutations,
  actions,
  getters
}
