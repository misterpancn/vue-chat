<script>
  export default {
    data () {
      return {
        loading: false,
        is_eye: false,
        passwordType: 'password',
        changePassword: {
          old_password: '',
          password: '',
          password_confirmation: ''
        }
      }
    },
    computed: {
      show: {
        get: function () {
          return this.$store.getters.getChangePwdShow
        },
        set: function (val) {
          this.$store.dispatch('setChangePwdShow', val)
        }
      },
      changePasswordRules () {
        const validatePassCheck = (rule, value, callback) => {
          if (value === '') {
            callback(new Error(this.$t('account.rules.enterPassAgain')))
          } else if (value !== this.changePassword.password) {
            callback(new Error(this.$t('account.rules.passwordConfirm')))
          } else {
            callback()
          }
        }
        return {
          old_password: [
            {required: true, message: this.$t('account.rules.passwordRequire'), trigger: 'blur'},
            {type: 'string', min: 6, message: this.$t('account.rules.passwordMinLimit', {min: 6}), trigger: 'blur'}
          ],
          password: [
            {required: true, message: this.$t('account.rules.passwordRequire'), trigger: 'blur'},
            {type: 'string', min: 6, message: this.$t('account.rules.passwordMinLimit', {min: 6}), trigger: 'blur'}
          ],
          password_confirmation: [
            {required: true, message: this.$t('account.rules.passwordRequire'), trigger: 'blur'},
            {validator: validatePassCheck, trigger: 'blur'},
            {type: 'string', min: 6, message: this.$t('account.rules.passwordMinLimit', {min: 6}), trigger: 'blur'}
          ]
        }
      }
    },
    methods: {
      // 密码显示隐藏
      funcShow: function () {
        if (this.is_eye === false) {
          this.is_eye = true
          this.passwordType = 'text'
        } else {
          this.is_eye = false
          this.passwordType = 'password'
        }
      },
      changePwd (name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            this.loading = true;
            this.$store.dispatch('changePassword', this.changePassword).then((r) => {
              this.loading = false
              this.show = false
              this.$Message.success({
                content: this.$t('notify.successOperation'),
                duration: 3
              });
            }).catch((e) => {
              this.$Message.warning({
                content: e.response.data.data,
                duration: 3
              });
              this.loading = false
            })
          } else {
            this.$Notice.error({
              title: this.$t('notifyTitle.errorReminding'),
              desc: this.$t('account.notify.fillInIncorrect')
            })
          }
        })
      }
    }
  }
</script>
<template>
    <Modal v-model="show" :mask-closable="false" footer-hide>
        <p slot="header" style="text-align: center;">{{ $t('account.changePassword') }}</p>
        <div class="m-ui-content">
            <Form ref="changePassword" :model="changePassword" :rules="changePasswordRules" :label-width="80">
                <FormItem prop="old_password" :label="$t('account.originalPassword')">
                    <Input v-model="changePassword.old_password" :placeholder="$t('account.rules.pleaseEnterOriginPwd')">
                    </Input>
                </FormItem>
                <FormItem prop="password" :label="$t('account.newPassword')">
                    <Input v-bind:type="passwordType" v-model="changePassword.password" :placeholder="$t('account.rules.passwordRequire')">
                    <Icon v-if="!is_eye" type="ios-eye-off-outline" slot="suffix"
                          style="font-size: 16px;cursor: pointer;" @click="funcShow"></Icon>
                    <Icon v-else type="ios-eye-outline" slot="suffix" style="font-size: 16px;cursor: pointer;"
                          @click="funcShow"></Icon>
                    </Input>
                </FormItem>
                <FormItem prop="password_confirmation" :label="$t('account.confirmPassword')">
                    <Input v-bind:type="passwordType" v-model="changePassword.password_confirmation" :placeholder="$t('account.rules.passwordRequire')">
                    </Input>
                </FormItem>
                <FormItem>
                    <Button type="primary" :loading="loading" @click="changePwd('changePassword')">
                        <span v-if="!loading">{{ $t('operation.modify') }}</span>
                        <span v-else>{{ $t('notify.loading') }}</span>
                    </Button>
                </FormItem>
            </Form>
        </div>
    </Modal>
</template>
<style lang="less">
    .m-ui-content {
        position: relative;
        .left-content {
            height: 100%;
            background: none;
            .m-col {
                font-size: 21px;
                margin: 10px 0;
            }
        }
    }
</style>