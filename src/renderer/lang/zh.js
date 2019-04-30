/**
 * Created by buck on 2019/4/30.
 */
export default {
  email: '请输入邮箱',
  password: '请输入密码',
  login: '登录',
  register: '注册',
  signIn: '登录',
  remember: '记住我',
  reset: '重置密码',
  rules: {
    passwordRequire: '请填写密码',
    emailRequire: '请填写邮箱',
    emailCheck: '邮箱格式错误',
    passwordConfirm: '请检查两次密码是否相同'
  },
  notify: {
    loginSuccess: '登录成功',
    loginError: '登录失败'
  },
  method: {
    passwordMin: (num) => {
      return '密码最小长度为 ' + num + ' 位'
    }
  }
}
