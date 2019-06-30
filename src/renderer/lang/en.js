/**
 * Created by buck on 2019/4/30.
 */
export default {
  account: {
    email: 'E-mail',
    password: 'Password',
    login: 'Login',
    register: 'Register',
    signIn: 'Sign in',
    remember: 'Remember Me',
    reset: 'Forgot Password',
    confirmPassword: 'Confirm Password',
    mobileNumber: 'Mobile Number',
    enterEmail: 'Enter your e-mail',
    name: 'name',
    logout: 'logout',
    username: 'User Name',
    information: 'Information',
    personalInformation: 'Personal information',
    registerTime: 'Registration time',
    joinDefaultGroup: 'Join the default group',
    modifyPersonalData: 'Modification of personal data',
    editMaterials: 'Editorial materials',
    changePassword: 'Change Password',
    originalPassword: 'Original Password',
    newPassword: 'New Password',
    modifyAvatar: 'Modify the Avatar',
    rules: {
      passwordRequire: 'Please fill in the password.',
      emailRequire: 'Mailbox cannot be empty',
      emailCheck: 'Incorrect email format',
      passwordConfirm: 'The two input passwords do not match!',
      enterPassAgain: 'Please enter your password again',
      enterMobileNumber: 'Please enter your mobile number',
      MobileNumberFormatError: 'Mobile phone number format error!',
      passwordMinLimit: 'The password length cannot be less than {min} bits',
      nameRequire: 'Please fill in the name',
      nameMinLimit: 'The name name cannot be less than {min} bits',
      mobileNumberMinLimit: 'The mobile number length cannot be less than {min} bits',
      maxLimit: 'The maximum length of this field is {max}',
      pleaseEnterOriginPwd: 'Please enter the original password'
    },
    notify: {
      loginSuccess: 'Login success!',
      loginError: 'Login error.',
      requestFailed: 'The request server failed!',
      fillInIncorrect: 'Fill in incorrect',
      authenticationFail: 'Authentication failure',
      registeredSuccessfully: 'Registered successfully'
    }
  },
  system: {
    language: {
      en: 'English',
      zh: 'Chinese'
    },
    checkForUpdate: 'Check for updates',
    isTheLatestVersion: 'It is the latest version',
    currentVersion: 'Current version',
    latestVersion: 'Latest version',
    releaseTime: 'Release time',
    packageSize: 'Package size',
    download: 'Download',
    install: 'Install'
  },
  operation: {
    modify: 'Modify',
    reSelection: 'Re-selection',
    sureToModify: 'Sure to modify'
  },
  notifyTitle: {
    validationFailed: 'Validation failed',
    errorReminding: 'Error reminding',
    errorOccurred: 'Error occurred',
    serverException: 'Server exception',
    reminding: 'Reminding',
    fileFormatIsIncorrect: 'The file format is incorrect',
    exceedingFileSizeLimit: 'Exceeding file size limit'
  },
  notify: {
    loading: 'Loading...',
    exitSuccess: 'Exit successfully',
    noDataQueried: 'No data queried',
    applicationHasBeenSent: 'The application has been sent',
    haveConfirmOperation: 'You have confirmed this operation?',
    successOperation: 'Successful operation',
    imgFileFormatIsIncorrectMes: 'File format of {fileName} is incorrect, please select jpg or png.',
    exceedingImageFileSizeLimitMes: 'File {fileName} is too large, no more than {size}.',
    functionNotOnlineYet: 'The function is not online yet, please stay tuned'
  },
  chat: {
    voice: 'Voice',
    inRecording: 'In recording...',
    deviceNotSupport: 'Your device does not support it',
    sendOut: 'Send out',
    loadingHistory: 'Loading history',
    rightClickMenu: 'Right click menu',
    chatId: 'Chat ID',
    messageSendFailed: 'Message Send Failure',
    operation: 'operation',
    addFriends: 'Add friends',
    addTo: 'Add to',
    FindGroupOrUser: 'Find a group or user',
    groupName: 'Group Name',
    hasBeenFriend: 'Has been a friend',
    alreadyInTheGroup: 'You\'re already in the group.',
    selectSendObject: 'Please select the sending object first.',
    applyTime: 'Application time',
    remarks: 'Remarks',
    agree: 'Agree',
    refuse: 'Refuse',
    groupApply: 'Group application',
    friendApply: 'Friends Application',
    passed: 'Passed',
    rejected: 'Rejected',
    notify: {
      serverErrorLogout: 'The server has an exception and is logging you out.',
      exitFailed: 'Exit failed, please try again later',
      confirmLogout: 'Do you really want to log out?',
      sendByCtrlEnter: 'Send by Ctrl+Enter',
      clickOrDragFile: 'Click or drag files here to upload'
    }
  }
}
