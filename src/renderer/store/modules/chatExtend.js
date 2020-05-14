const state = {
  inputNoticeList: [],
  voiceInfo: null
}

const mutations = {
  SET_IN_LIST: (state, data) => {
    let isSave = false
    state.inputNoticeList.map((item) => {
      if (item.chat_id === data.chat_id) {
        item.data = data.data
        isSave = true;
      }
    })
    if (!isSave) {
      state.inputNoticeList.push({
        chat_id: data.chat_id,
        uid: data.uid,
        data: data.data
      })
    }
  },
  CLEAR_CHAT_EXT_DATA: (state) => {
    state.inputNoticeList = [];
  },
  SET_VOICE_INFO: (state, data) => {
    state.voiceInfo = data
  }
}

const actions = {
  setInputNoticeList ({ commit }, data) {
    commit('SET_IN_LIST', data)
  },
  clearChatExtData ({commit}) {
    commit('CLEAR_CHAT_EXT_DATA')
  },
  voiceInfo ({commit}, data) {
    commit('SET_VOICE_INFO', data)
  }
}

const getters = {
  getInputNoticeList: state => state.inputNoticeList,
  getInputNoticeStatusByCID: (state) => (chatId) => {
    let status = false;
    state.inputNoticeList.map((item) => {
      if (item.chat_id === chatId && item.data === 'inputting') {
        status = true;
      }
    })
    return status
  },
  getVoiceInfo: state => state.voiceInfo
}

export default {
  state,
  mutations,
  actions,
  getters
}
