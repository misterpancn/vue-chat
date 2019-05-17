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
      mobileNumberMinLimit: 'The mobile number length cannot be less than {min} bits'
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
    }
  },
  notifyTitle: {
    validationFailed: 'Validation failed',
    errorReminding: 'Error reminding',
    errorOccurred: 'Error occurred',
    serverException: 'Server exception',
    reminding: 'Reminding'
  },
  notify: {
    loading: 'Loading...',
    exitSuccess: 'Exit successfully'
  },
  chat: {
    voice: 'Voice',
    inRecording: 'In recording...',
    deviceNotSupport: 'Your device does not support it',
    sendOut: 'Send out',
    notify: {
      serverErrorLogout: 'The server has an exception and is logging you out.',
      exitFailed: 'Exit failed, please try again later',
      confirmLogout: 'Do you really want to log out?',
      sendByCtrlEnter: 'Send by Ctrl+Enter'
    }
  }
}
