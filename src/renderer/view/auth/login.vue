<style scoped>
    .c-center {
        height: -webkit-fill-available;
        width: 100%;
        position: absolute;
    }
</style>
<template>
    <div class="row justify-content-center c-center">
        <app-menu v-bind:showLogo="true"></app-menu>
        <Card :bordered="false" :xs="8" :sm="4" :md="6" :lg="8" dis-hover>
            <p slot="title">{{ $t('account.login') }}</p>
            <a slot="extra" @click="toRegister"><router-link to="/register">{{ $t('account.register') }}</router-link></a>
            <div class="card-body">
                <Form ref="formInline" :model="formInline" :rules="ruleInline">
                    <FormItem>
                        <Select v-model="language" style="float: right" size="large">
                            <Icon type="md-globe" slot="prefix" style="font-size: 18px;"></Icon>
                            <Option v-for="item in languages" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem prop="mail">
                        <Input v-model="formInline.mail" :placeholder="$t('account.email')" size="large" @keydown.native.enter.prevent ="handleSubmit('formInline')">
                        <Icon type="md-mail" slot="prefix" style="font-size: 18px;"></Icon>
                        </Input>
                    </FormItem>
                    <FormItem prop="password">
                        <Input v-bind:type="passwordType" v-model="formInline.password" :placeholder="$t('account.password')"
                               size="large" @keydown.native.enter.prevent ="handleSubmit('formInline')">
                        <Icon type="md-lock" slot="prefix" style="font-size: 18px;"></Icon>
                        <Icon v-if="!formInline.is_eye" type="ios-eye-off-outline" slot="suffix"
                              style="font-size: 18px;cursor: pointer;" @click="funcShow"></Icon>
                        <Icon v-else type="ios-eye-outline" slot="suffix" style="font-size: 18px;cursor: pointer;"
                              @click="funcShow"></Icon>
                        </Input>
                    </FormItem>
                    <FormItem>
                        <p style="text-align: right;"><a @click="openExternal">{{$t('account.forgotPassword')}}</a></p>
                        <Button type="primary" :loading="loading" @click="handleSubmit('formInline')" long>
                            <span v-if="!loading">{{ $t('account.signIn') }}</span>
                            <span v-else>{{ $t('notify.loading') }}</span>
                        </Button>
                    </FormItem>
                </Form>
            </div>
            <update></update>
        </Card>
    </div>
</template>

<script>
  import {ipcRenderer, shell} from 'electron'
  import config from '@/store/config/config'
  import update from '@/components/Login/update'
  import appMenu from '@/components/AppMenu'
  export default {
    components: {
      update, appMenu
    },
    data () {
      return {
        formInline: {
          password: '',
          mail: '',
          is_eye: false
        },
        loading: false,
        passwordType: 'password',
        language: this.$store.getters.getLanguage
      }
    },
    computed: {
      languages () {
        return [
          {value: 'en', label: this.$t('system.language.en')},
          {value: 'zh-CN', label: this.$t('system.language.zh')}
        ]
      },
      ruleInline () {
        return {
          password: [
            {required: true, message: this.$t('account.rules.passwordRequire'), trigger: 'blur'},
            {type: 'string', min: 6, message: this.$t('account.rules.passwordMinLimit', {min: 6}), trigger: 'blur'}
          ],
          mail: [
            {required: true, message: this.$t('account.rules.emailRequire'), trigger: 'blur'},
            {type: 'email', message: this.$t('account.rules.emailCheck'), trigger: 'blur'}
          ]
        }
      },
      forgetPassLink () {
        let protocol = 'http://'
        if (config.openssl) protocol = 'https://';
        return protocol + config.serviceAddress + '/password/forgot'
      }
    },
    watch: {
      language () {
        this.$i18n.locale = this.language
        this.$store.dispatch('setLanguage', this.language)
      }
    },
    methods: {
      handleSubmit (name) {
        if (this.loading) {
          return false;
        }
        this.$refs[name].validate((valid) => {
          if (valid) {
            this.loading = true;
            // qs 方法将json对象转成 x-www-form格式 以便后台接收
            this.$store.dispatch('login', {
              email: this.formInline.mail,
              password: this.formInline.password,
              is_app: true
            }).then((response) => {
              if (response.status === 200 && response.data.status_code === 200) {
                this.$router.push('/chat')
                ipcRenderer.send('change-win-size', config.windowSize.chat)
              } else {
                this.$Notice.error({
                  title: this.$t('notifyTitle.validationFailed'),
                  desc: response.data.data
                })
                this.loading = false;
              }
            }).catch((error) => {
              console.log(error)
              this.loading = false;
              this.$Notice.error({
                title: this.$t('notifyTitle.errorReminding'),
                desc: error.response.data.data ? error.response.data.data : this.$t('account.notify.requestFailed')
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
      },
      toRegister () {
        ipcRenderer.send('change-win-size', config.windowSize.register)
      },
      openExternal () {
        shell.openExternal(this.forgetPassLink)
      }
    },
    mounted () {
      this.$store.dispatch('setLanguage', this.language)
    }
  }
</script>
