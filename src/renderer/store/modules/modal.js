const state = {
  editInfoShow: false,
  userInfoShow: false,
  addToShow: false
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
  DESTROY (state) {
    state.editInfoShow = false
    state.addToShow = false
    state.userInfoShow = false
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
  }
}

const getters = {
  getEditInfoShow: state => state.editInfoShow,
  getUserInfoShow: state => state.userInfoShow,
  getAddToShow: state => state.addToShow
}

export default {
  state,
  mutations,
  actions,
  getters
}
