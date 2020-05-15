<style scoped>
    .c-center {
        height: -webkit-fill-available;
        width: 100%;
    }
</style>
<template>
    <div class="row justify-content-center c-center">
        <Card :bordered="false" :xs="8" :sm="4" :md="6" :lg="8">
            <p slot="title">Register</p>
            <a slot="extra"><router-link to="/login">Login</router-link></a>
            <div class="card-body">
                <Form ref="formInline" :model="formInline" :rules="ruleInline" :label-width="80">
                    <FormItem label="Username" prop="name">
                        <Input v-model="formInline.name" placeholder="Enter your name"></Input>
                    </FormItem>
                    <FormItem prop="mail" label="E-mail">
                        <Input v-model="formInline.mail" placeholder="Enter your e-mail"></Input>
                    </FormItem>
                    <FormItem prop="phone" label="Mobile Number ">
                        <Input v-model="formInline.phone" placeholder="Enter your mobile number ">
                        <Select v-model="formInline.mbPrefix" slot="prepend" style="width: 70px">
                            <Option v-for="mp in allMbPrefix" :value="mp">{{ mp }}</Option>
                        </Select>
                        </Input>
                    </FormItem>
                    <FormItem prop="password" label="Password">
                        <Input v-bind:type="passwordType" v-model="formInline.password" placeholder="Password">
                        <Icon v-if="!formInline.is_eye" type="ios-eye-off-outline" slot="suffix"
                              style="font-size: 16px;cursor: pointer;" @click="funcShow"></Icon>
                        <Icon v-else type="ios-eye-outline" slot="suffix" style="font-size: 16px;cursor: pointer;"
                              @click="funcShow"></Icon>
                        </Input>
                    </FormItem>
                    <FormItem prop="confirmPass" label="Confirm Password">
                        <Input v-bind:type="passwordType" v-model="formInline.confirmPass" placeholder="Confirm Password">
                        </Input>
                    </FormItem>
                    <FormItem>
                        <Button type="primary" :loading="loading" @click="handleSubmit('formInline')">
                            <span v-if="!loading">Sign up</span>
                            <span v-else>Loading...</span>
                        </Button>
                    </FormItem>
                </Form>
            </div>
        </Card>
    </div>
</template>
<script>
  import axios from 'axios'
  import Qs from 'qs'
  import config from './../../store/config/config'
  export default {
    data () {
      const validatePassCheck = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('Please enter your password again'))
        } else if (value !== this.formInline.password) {
          callback(new Error('The two input passwords do not match!'))
        } else {
          callback()
        }
      }
      const validatePhoneNumber = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('Please enter your mobile number again'))
        } else if (value.length !== 11 && this.formInline.mbPrefix === '+86') {
          callback(new Error('Mobile phone number format error!'))
        } else {
          callback()
        }
      }
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
        ruleInline: {
          password: [
            {required: true, message: 'Please fill in the password.', trigger: 'blur'},
            {type: 'string', min: 6, message: 'The password length cannot be less than 6 bits', trigger: 'blur'}
          ],
          mail: [
            {required: true, message: 'Mailbox cannot be empty', trigger: 'blur'},
            {type: 'email', message: 'Incorrect email format', trigger: 'blur'}
          ],
          name: [
            {required: true, message: 'Please fill in the name', trigger: 'blur'},
            {type: 'string', min: 2, message: 'The name name cannot be less than 2 bits', trigger: 'blur'}
          ],
          confirmPass: [
            {required: true, message: 'Please fill in the password.', trigger: 'blur'},
            {validator: validatePassCheck},
            {type: 'string', min: 6, message: 'The password length cannot be less than 6 bits', trigger: 'blur'}
          ],
          phone: [
            {required: true, message: 'Please fill in the mobile number.', trigger: 'blur'},
            {validator: validatePhoneNumber, trigger: 'blur'},
            {type: 'string', min: 8, message: 'The mobile number length cannot be less than 8 bits', trigger: 'blur'}
          ]
        },
        allMbPrefix: config.allMbPrefix,
        loading: false,
        passwordType: 'password'
      }
    },
    methods: {
      handleSubmit (name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            this.loading = true;
            // qs 方法将json对象转成 x-www-form格式 以便后台接收
            axios.post('http://' + config.serviceAddress + '/api/register', Qs.stringify({
              email: this.formInline.mail,
              password: this.formInline.password,
              name: this.formInline.name,
              phone: this.formInline.phone,
              mb_prefix: this.formInline.mbPrefix
            })).then((response) => {
              console.log(response)
              if (response.data.status_code === 200) {
                this.$Notice.success({
                  title: '注册成功',
                  desc: ''
                })
                this.$router.push('/login')
              } else {
                this.$Notice.error({
                  title: '验证失败',
                  desc: response.data.message
                })
                this.loading = false;
              }
            }).catch((error) => {
              console.log(error)
              this.loading = false;
              this.$Notice.error({
                title: '发生错误',
                desc: error.response.data.message
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
