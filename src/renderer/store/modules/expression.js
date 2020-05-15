import axios from '@/request'
import ws from '@/request/websocket'
const state = {
  expression: []
}

const mutations = {
  SET_EXPRESSION (state, data) {
    state.expression = data
  }
}

const actions = {
  expression ({commit}) {
    axios.getExpression().then((response) => {
      let data = []
      if (response.status === 200) {
        for (let i = 0; i < response.data.length; i++) {
          data.push({
            id: response.data[i].id,
            phrase: response.data[i].phrase,
            path: ws.url + '/resources/img/' + response.data[i].path
          })
        }
        commit('SET_EXPRESSION', data)
      }
    })
  }
}

const getters = {
  getExpression: state => {
    return state.expression
  },
  getExpressionById: state => (expressionId) => {
    var res = {};
    if (state.expression.length > 0) {
      state.expression.map((v) => {
        if (v.id === expressionId) {
          res = v
        }
      })
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

