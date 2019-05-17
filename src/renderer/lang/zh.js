/**
 * Created by buck on 2019/4/30.
 */
export default {
  account: {
    email: '邮箱',
    password: '密码',
    login: '登录',
    register: '注册',
    signIn: '登录',
    remember: '记住我',
    reset: '重置密码',
    confirmPassword: '确认密码',
    mobileNumber: '手机号',
    enterEmail: '请填写邮箱',
    name: '用户名',
    rules: {
      passwordRequire: '请填写密码',
      emailRequire: '请填写邮箱',
      emailCheck: '邮箱格式错误',
      passwordConfirm: '请检查两次密码是否相同',
      enterPassAgain: '请再次输入密码',
      enterMobileNumber: '请输入你的手机号',
      MobileNumberFormatError: '手机号格式错误',
      passwordMinLimit: '密码最小长度为{min}字符',
      nameRequire: '请填写用户名',
      nameMinLimit: '用户名长度最小为{min}字符',
      mobileNumberMinLimit: '手机号长度最小为{min}字符'
    },
    notify: {
      loginSuccess: '登录成功',
      loginError: '登录失败',
      requestFailed: '请求服务器失败！',
      fillInIncorrect: '填写有误',
      authenticationFail: '身份验证失败',
      registeredSuccessfully: '注册成功'
    }
  },
  system: {
    language: {
      en: '英文',
      zh: '简体中文'
    }
  },
  notifyTitle: {
    validationFailed: '验证失败',
    errorReminding: '错误提醒',
    errorOccurred: '发生错误',
    serverException: '服务器异常',
    reminding: '提醒'
  },
  notify: {
    loading: '加载中...',
    exitSuccess: '退出成功'
  },
  chat: {
    voice: '语音',
    inRecording: '录制中...',
    deviceNotSupport: '您的设备不支持',
    sendOut: '发送',
    notify: {
      serverErrorLogout: '服务器出现异常，正在帮您退出登录',
      exitFailed: '退出失败，请稍后重试',
      confirmLogout: '您真的要退出登录吗？',
      sendByCtrlEnter: '按Ctrl+Enter发送'
    }
  }
}