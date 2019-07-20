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
    logout: '退出',
    username: '昵称',
    information: '资料',
    personalInformation: '个人信息',
    registerTime: '注册时间',
    joinDefaultGroup: '加入默认群',
    modifyPersonalData: '修改个人资料',
    editMaterials: '编辑资料',
    changePassword: '修改密码',
    originalPassword: '原始密码',
    newPassword: '新密码',
    modifyAvatar: '修改头像',
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
      mobileNumberMinLimit: '手机号长度最小为{min}字符',
      maxLimit: '该字段最大长度为{max}',
      pleaseEnterOriginPwd: '请输入原始密码'
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
    },
    checkForUpdate: '检查更新',
    isTheLatestVersion: '已是最新版本',
    currentVersion: '当前版本',
    latestVersion: '最新版本',
    releaseTime: '发布时间',
    packageSize: '安装包大小',
    download: '下载',
    install: '安装'
  },
  operation: {
    modify: '修改',
    reSelection: '重新选择',
    sureToModify: '确定修改'
  },
  notifyTitle: {
    validationFailed: '验证失败',
    errorReminding: '错误提醒',
    errorOccurred: '发生错误',
    serverException: '服务器异常',
    reminding: '提醒',
    fileFormatIsIncorrect: '文件格式不正确',
    exceedingFileSizeLimit: '超出文件大小限制'
  },
  notify: {
    loading: '加载中...',
    exitSuccess: '退出成功',
    noDataQueried: '未查询到数据',
    applicationHasBeenSent: '申请已发送',
    haveConfirmOperation: '您已确认这个操作？',
    successOperation: '操作成功',
    imgFileFormatIsIncorrectMes: '{fileName}文件格式不正确，请选择JPG或PNG。',
    functionNotOnlineYet: '功能暂未上线，敬请期待',
    thisIsYou: '这是你自己哦'
  },
  chat: {
    voice: '语音',
    inRecording: '录制中...',
    deviceNotSupport: '您的设备不支持',
    sendOut: '发送',
    loadingHistory: '加载历史',
    rightClickMenu: '右键菜单',
    chatId: 'Chat ID',
    messageSendFailed: '消息发送失败',
    operation: '操作',
    addFriends: '加好友',
    addTo: '添加',
    FindGroupOrUser: '查找群或用户',
    groupName: '群名称',
    hasBeenFriend: '已是好友',
    alreadyInTheGroup: '你已经在群组中',
    selectSendObject: '请先选择发送对象',
    applyTime: '申请时间',
    remarks: '备注',
    agree: '同意',
    refuse: '拒绝',
    groupApply: '群申请',
    friendApply: '好友申请',
    passed: '已通过',
    rejected: '已拒绝',
    messageHistory: '历史消息',
    groupOwner: '群主',
    createTime: '创建时间',
    groupMembers: '群成员',
    groupInformation: '群信息',
    notify: {
      serverErrorLogout: '服务器出现异常，正在帮您退出登录',
      exitFailed: '退出失败，请稍后重试',
      confirmLogout: '您真的要退出登录吗？',
      sendByCtrlEnter: '按Ctrl+Enter发送',
      clickOrDragFile: '单击或拖动文件到此处上载'
    }
  }
}
