<style scoped>
    .c-center {
        height: -webkit-fill-available;
        width: 100%;
    }
</style>
<template>
    <div class="row justify-content-center c-center">
        <div class="col-md-4" style="margin: auto;">
            <div class="card card-default">
                <div class="card-header">Login</div>

                <div class="card-body">
                    <Form ref="formInline" :model="formInline" :rules="ruleInline">
                        <FormItem prop="mail">
                            <Input v-model="formInline.mail" placeholder="Enter your e-mail" size="large">
                            <Icon type="ios-mail-outline" slot="prefix" style="font-size: 18px;"></Icon>
                            </Input>
                        </FormItem>
                        <FormItem prop="password">
                            <Input v-bind:type="passwordType" v-model="formInline.password" placeholder="Password"
                                   size="large">
                            <Icon type="ios-lock-outline" slot="prefix" style="font-size: 18px;"></Icon>
                            <Icon v-if="formInline.is_eye" type="ios-eye-off-outline" slot="suffix"
                                  style="font-size: 18px;" @click="funcShow"></Icon>
                            <Icon v-else type="ios-eye-outline" slot="suffix" style="font-size: 18px;"
                                  @click="funcShow"></Icon>
                            </Input>
                        </FormItem>
                        <FormItem>
                            <Button type="primary" :loading="loading" @click="handleSubmit('formInline')">
                                <span v-if="!loading">Signin</span>
                                <span v-else>Loading...</span>
                            </Button>
                        </FormItem>
                    </Form>
                </div>
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script>
  import axios from 'axios'
  import Qs from 'qs'
  import store from './../../store/modules/store'
  import chat from './../../store/modules/chat'
  export default {
    data () {
      return {
        formInline: {
          password: '',
          mail: '',
          is_eye: false
        },
        ruleInline: {
          password: [
            {required: true, message: 'Please fill in the password.', trigger: 'blur'},
            {type: 'string', min: 6, message: 'The password length cannot be less than 6 bits', trigger: 'blur'}
          ],
          mail: [
            {required: true, message: 'Mailbox cannot be empty', trigger: 'blur'},
            {type: 'email', message: 'Incorrect email format', trigger: 'blur'}
          ]
        },
        loading: false,
        passwordType: 'password'
      }
    },
    methods: {
      handleSubmit (name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            this.loading = true;
            var _this = this;
            // qs 方法将json对象转成 x-www-form格式 以便后台接收
            axios.post('https://chat.misterpan.cn/login.php?action=login', Qs.stringify({
              email: this.formInline.mail,
              password: this.formInline.password,
              is_app: true
            })).then(function (response) {
              console.log(response)
              if (response.data.mess === 'success') {
                _this.$Notice.success({
                  title: '登录成功',
                  desc: ''
                })
                store.save({
                  user: {
                    userId: response.data.user_id,
                    name: response.data.name,
                    img: chat.url + response.data.img
                  },
                  sessionList: []
                })
                _this.$router.push('/chat')
              } else {
                _this.$Notice.error({
                  title: '验证失败',
                  desc: response.data.mess
                })
                _this.loading = false;
              }
            }).catch(function (error) {
              console.log(error)
              _this.loading = false;
              _this.$Notice.error({
                title: '错误提醒',
                desc: '请求服务器失败！'
              })
            })
          } else {
            this.$Notice.error({
              title: '错误提醒',
              desc: '填写有误！'
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
