<style scoped>
    .c-center {
        height: -webkit-fill-available;
        width: 100%;
    }
</style>
<template>
    <div class="row justify-content-center c-center">
        <Card :bordered="false" :xs="8" :sm="4" :md="6" :lg="8">
            <p slot="title">{{ $t('account.register') }}</p>
            <a slot="extra"><router-link to="/login">{{ $t('account.login') }}</router-link></a>
            <div class="card-body">
                <Form ref="formInline" :model="formInline" :rules="ruleInline" :label-width="80">
                    <FormItem :label="$t('account.name')" prop="name">
                        <Input v-model="formInline.name" :placeholder="$t('account.rules.nameRequire')"></Input>
                    </FormItem>
                    <FormItem prop="mail" :label="$t('account.email')">
                        <Input v-model="formInline.mail" :placeholder="$t('account.enterEmail')"></Input>
                    </FormItem>
                    <FormItem prop="phone" :label="$t('account.mobileNumber')">
                        <Input v-model="formInline.phone" :placeholder="$t('account.rules.enterMobileNumber')">
                        <Select v-model="formInline.mbPrefix" slot="prepend" style="width: 70px">
                            <Option v-for="(mp, index) in allMbPrefix" :value="mp" :key="index">{{ mp }}</Option>
                        </Select>
                        </Input>
                    </FormItem>
                    <FormItem prop="password" :label="$t('account.password')">
                        <Input v-bind:type="passwordType" v-model="formInline.password" :placeholder="$t('account.rules.passwordRequire')">
                        <Icon v-if="!formInline.is_eye" type="ios-eye-off-outline" slot="suffix"
                              style="font-size: 16px;cursor: pointer;" @click="funcShow"></Icon>
                        <Icon v-else type="ios-eye-outline" slot="suffix" style="font-size: 16px;cursor: pointer;"
                              @click="funcShow"></Icon>
                        </Input>
                    </FormItem>
                    <FormItem prop="confirmPass" :label="$t('account.confirmPassword')">
                        <Input v-bind:type="passwordType" v-model="formInline.confirmPass" :placeholder="$t('account.rules.passwordRequire')">
                        </Input>
                    </FormItem>
                    <FormItem>
                        <Button type="primary" :loading="loading" @click="handleSubmit('formInline')">
                            <span v-if="!loading">{{ $t('account.signIn') }}</span>
                            <span v-else>{{ $t('notify.loading') }}</span>
                        </Button>
                    </FormItem>
                </Form>
            </div>
        </Card>
    </div>
</template>
<script>
  import config from './../../store/config/config'
  export default {
    data () {
      return {
        formInline: {
          password: '',
          mail: '',
          name: '',
          confirmPass: '',
          mbPrefix: '+86',
          phone: '',
          is_eye: false
        },
        allMbPrefix: config.allMbPrefix,
        loading: false,
        passwordType: 'password'
      }
    },
    computed: {
      ruleInline () {
        const validatePassCheck = (rule, value, callback) => {
          if (value === '') {
            callback(new Error(this.$t('account.rules.enterPassAgain')))
          } else if (value !== this.formInline.password) {
            callback(new Error(this.$t('account.rules.passwordConfirm')))
          } else {
            callback()
          }
        }
        const validatePhoneNumber = (rule, value, callback) => {
          if (value === '') {
            callback(new Error(this.$t('account.rules.enterMobileNumber')))
          } else if (value.length !== 11 && this.formInline.mbPrefix === '+86') {
            callback(new Error(this.$t('account.rules.MobileNumberFormatError')))
          } else {
            callback()
          }
        }
        return {
          password: [
            {required: true, message: this.$t('account.rules.passwordRequire'), trigger: 'blur'},
            {type: 'string', min: 6, message: this.$t('account.rules.passwordMinLimit', {min: 6}), trigger: 'blur'}
          ],
          mail: [
            {required: true, message: this.$t('account.rules.emailRequire'), trigger: 'blur'},
            {type: 'email', message: this.$t('account.rules.emailCheck'), trigger: 'blur'}
          ],
          name: [
            {required: true, message: this.$t('account.rules.nameRequire'), trigger: 'blur'},
            {type: 'string', min: 2, message: this.$t('account.rules.nameMinLimit', {min: 2}), trigger: 'blur'}
          ],
          confirmPass: [
            {required: true, message: this.$t('account.rules.passwordRequire'), trigger: 'blur'},
            {validator: validatePassCheck},
            {type: 'string', min: 6, message: this.$t('account.rules.passwordMinLimit', {min: 6}), trigger: 'blur'}
          ],
          phone: [
            {required: true, message: this.$t('account.rules.enterMobileNumber'), trigger: 'blur'},
            {validator: validatePhoneNumber, trigger: 'blur'},
            {type: 'string', min: 8, message: this.$t('account.rules.mobileNumberMinLimit', {min: 8}), trigger: 'blur'}
          ]
        }
      }
    },
    methods: {
      handleSubmit (name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            this.loading = true;
            // qs 方法将json对象转成 x-www-form格式 以便后台接收
            this.$store.dispatch('register', {
              email: this.formInline.mail,
              password: this.formInline.password,
              name: this.formInline.name,
              phone: this.formInline.phone,
              mb_prefix: this.formInline.mbPrefix
            }).then((response) => {
              console.log(response)
              if (response.data.status_code === 200) {
                this.$Notice.success({
                  title: this.$t('account.notify.registeredSuccessfully'),
                  desc: ''
                })
                this.$router.push('/login')
              } else {
                this.$Notice.error({
                  title: this.$t('notifyTitle.validationFailed'),
                  desc: response.data.message
                })
                this.loading = false;
              }
            }).catch((error) => {
              console.log(error)
              this.loading = false;
              this.$Notice.error({
                title: this.$t('notifyTitle.errorOccurred'),
                desc: this.$t('account.notify.requestFailed')
              })
            })
          } else {
            this.$Notice.error({
              title: this.$t('notifyTitle.errorReminding'),
              desc: this.$t('account.notify.fillInIncorrect')
            })
          }
        })
      },
      // 密码显示隐藏
      funcShow: function () {
        if (this.formInline.is_eye === false) {
          this.formInline.is_eye = true
          this.passwordType = 'text'
        } else {
          this.formInline.is_eye = false
          this.passwordType = 'password'
        }
      }
    }
  }
</script>
