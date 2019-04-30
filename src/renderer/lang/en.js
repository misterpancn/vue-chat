/**
 * Created by buck on 2019/4/30.
 */
export default {
  email: 'Enter your e-mail',
  password: 'Password',
  login: 'Login',
  register: 'Register',
  signIn: 'Sign in',
  remember: 'Remember Me',
  reset: 'Forgot Password',
  rules: {
    passwordRequire: 'Please fill in the password.',
    emailRequire: 'Mailbox cannot be empty',
    emailCheck: 'Incorrect email format',
    passwordConfirm: 'Please match two password'
  },
  notify: {
    loginSuccess: 'Login success!',
    loginError: 'Login error.'
  },
  method: {
    passwordMin: (num) => {
      return 'The password length cannot be less than ' + num + ' bits'
    }
  }
}
