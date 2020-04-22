import request from '@/request'
const state = {
  chatFileDownloadProgress: 0,
  currentFileId: ''
}

const mutations = {
  SET_CHAT_FDP: (state, data) => {
    state.chatFileDownloadProgress = data
  },
  SET_CURR_FILE_ID: (state, data) => {
    state.currentFileId = data
  }
}

const actions = {
  setChatFDP ({ commit }, data) {
    commit('SET_CHAT_FDP', data)
  },
  setFileId ({ commit }, data) {
    commit('SET_CURR_FILE_ID', data)
  },
  chatFileDown ({commit}, data) {
    return new Promise((resolve, reject) => {
      request.chatFileDownload(data.selectId, data.mesId, {save_path: data.savePath}).then((res) => {
        commit('SET_CHAT_FDP', 0)
        commit('SET_CURR_FILE_ID', '')
        resolve(res)
      }).catch((e) => { reject(e) })
    })
  },
  groupFileDown ({commit}, data) {
    return new Promise((resolve, reject) => {
      request.groupFileDownload(data.selectId, data.mesId, {save_path: data.savePath}).then((res) => {
        commit('SET_CHAT_FDP', 0)
        commit('SET_CURR_FILE_ID', '')
        resolve(res)
      }).catch((e) => { reject(e) })
    })
  }
}

const getters = {
  getChatFDP: state => state.chatFileDownloadProgress,
  currentFileID: state => state.currentFileId
}

export default {
  state,
  mutations,
  actions,
  getters
}

