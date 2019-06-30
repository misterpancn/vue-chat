<script>
  import config from '@/store/config/config'
  export default {
    data () {
      return {
        editInfo: {
          email: this.$store.getters.getUser.email,
          name: this.$store.getters.getUser.name,
          phone: this.$store.getters.getUser.phone
        },
        allMbPrefix: config.allMbPrefix,
        loading: false
      }
    },
    computed: {
      show: {
        get: function () {
          return this.$store.getters.getEditInfoShow
        },
        set: function (val) {
          this.$store.dispatch('upEditInfoShow', val)
        }
      },
      chatNumber () {
        return this.$store.getters.getUser.chat_number
      },
      mbPrefix () {
        return this.$store.getters.getUser.mb_prefix ? this.$store.getters.getUser.mb_prefix : '+86'
      },
      ruleInline () {
        const validatePhoneNumber = (rule, value, callback) => {
          if (value === '') {
            callback(new Error(this.$t('account.rules.enterMobileNumber')))
          } else if (value.length !== 11 && this.mbPrefix === '+86') {
            callback(new Error(this.$t('account.rules.MobileNumberFormatError')))
          } else {
            callback()
          }
        }
        return {
          email: [
            {required: true, message: this.$t('account.rules.emailRequire'), trigger: 'blur'},
            {type: 'email', message: this.$t('account.rules.emailCheck'), trigger: 'blur'}
          ],
          name: [
            {required: true, message: this.$t('account.rules.nameRequire'), trigger: 'blur'},
            {type: 'string', min: 2, message: this.$t('account.rules.nameMinLimit', {min: 2}), trigger: 'blur'},
            {type: 'string', max: 12, message: this.$t('account.rules.maxLimit', {max: 12}), trigger: 'blur'}
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
            this.$store.dispatch('updateUserInfo', this.editInfo).then((r) => {
              // 更新自己的信息
              this.$store.dispatch('me')
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
        <p slot="header" style="text-align: center;">{{ $t('account.modifyPersonalData') }}</p>
        <div class="m-ui-content">
            <Form ref="editInfo" :model="editInfo" :rules="ruleInline" :label-width="80">
                <FormItem :label="$t('chat.chatId')">
                    <Input v-model="chatNumber" disabled></Input>
                </FormItem>
                <FormItem :label="$t('account.name')" prop="name">
                    <Input v-model="editInfo.name" :placeholder="$t('account.rules.nameRequire')"></Input>
                </FormItem>
                <FormItem prop="email" :label="$t('account.email')">
                    <Input v-model="editInfo.email" :placeholder="$t('account.enterEmail')"></Input>
                </FormItem>
                <FormItem prop="phone" :label="$t('account.mobileNumber')">
                    <Input v-model="editInfo.phone" :placeholder="$t('account.rules.enterMobileNumber')">
                    <Select v-model="mbPrefix" slot="prepend" style="width: 70px">
                        <Option v-for="(mp, index) in allMbPrefix" :value="mp" :key="index">{{ mp }}</Option>
                    </Select>
                    </Input>
                </FormItem>
                <FormItem>
                    <Button type="primary" :loading="loading" @click="handleSubmit('editInfo')">
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