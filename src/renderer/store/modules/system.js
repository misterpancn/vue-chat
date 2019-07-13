const state = {
  language: localStorage.getItem('language') || 'zh-CN'
}

const mutations = {
  SET_LANGUAGE: (state, language) => {
    state.language = language
    localStorage.setItem('language', language)
  }
}

const actions = {
  setLanguage ({ commit }, language) {
    commit('SET_LANGUAGE', language)
  }
}

const getters = {
  getLanguage: state => state.language
}

export default {
  state,
  mutations,
  actions,
  getters
}
