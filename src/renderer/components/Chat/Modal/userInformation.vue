<script>
    import axios from '@/request'
    export default {
      props: [ 'isGroup' ],
      data () {
        return {
          loading: false
        }
      },
      computed: {
        show: {
          get: function () {
            if (this.$store.getters.getUserInfoShow) {
              this.$Spin.hide();
            }
            return this.$store.getters.getUserInfoShow
          },
          set: function (val) {
            if (!val) {
              this.$store.dispatch('resetUserInfo')
            }
            this.$store.dispatch('upUserInfoShow', val)
          }
        },
        userInfo () {
          return this.$store.getters.getUserInfo.user_info
        }
      },
      methods: {
        addFriends () {
          let uid = this.userInfo.id
          if (uid > 0) {
            this.loading = true;
            axios.addFriends({friend_id: uid}).then((r) => {
              this.$Message.success({
                content: this.$t('notify.applicationHasBeenSent'),
                duration: 3
              });
              this.loading = false;
            }).catch((e) => {
              this.$Message.error({
                content: e.response.data.data,
                duration: 3
              });
              this.loading = false;
            })
          }
        },
        unfriend () {
          this.$Modal.confirm({
            title: this.$t('notify.haveConfirmOperation'),
            loading: true,
            onOk: () => {
              axios.unFriend(this.$store.getters.selectId).then((r) => {
                this.$Modal.remove()
                this.$Message.success({
                  content: this.$t('notify.successOperation'),
                  duration: 3
                });
                this.show = false
                this.$store.dispatch('setSelectId', 0)
                this.$store.dispatch('setIsGroup', false)
              }).catch((e) => {
                this.$Message.error({
                  content: this.$t('notifyTitle.errorOccurred'),
                  duration: 3
                });
                this.$Modal.remove()
              })
            }
          })
        }
      }
    }
</script>
<template>
    <Drawer v-model="show" :closable="false" footer-hide>
        <p slot="header" style="text-align: center;">{{ $t('account.information') }}</p>
        <div class="m-ui-content-information" v-if="userInfo">
            <div>
                <img height="120" width="120" :src="userInfo.photo" style="display: block; margin: 0 auto;" />
            </div>
            <Divider orientation="left" size="small">{{$t('account.personalInformation')}}</Divider>
            <div class="m-ui-gu-gi">
                <Row class="m-ui-gu-row">
                    <Col span="8">{{$t('chat.chatId')}}</Col><Col span="16">{{userInfo.chat_number}}</Col>
                </Row>
                <Row class="m-ui-gu-row">
                    <Col span="8">{{$t('account.username')}}</Col><Col span="16">{{ userInfo.name }}</Col>
                </Row>
                <Row class="m-ui-gu-row">
                    <Col span="8">{{$t('account.email')}}</Col><Col span="16">{{ userInfo.email }}</Col>
                </Row>
                <Row class="m-ui-gu-row">
                    <Col span="8">{{$t('account.mobileNumber')}}</Col><Col span="16">{{ userInfo.mb_prefix + userInfo.phone }}</Col>
                </Row>
                <Row class="m-ui-gu-row">
                    <Col span="8">{{$t('account.registerTime')}}</Col><Col span="16">{{ userInfo.created_at }}</Col>
                </Row>
            </div>
            <div class="m-ui-group-user-bottom">
                <Button v-if="isGroup" type="success" :loading="loading" long @click="addFriends">{{$t('chat.addFriends')}}</Button>
                <Button v-else type="error" long @click="unfriend">{{$t('chat.unfriending')}}</Button>
            </div>
        </div>
        <div class="m-ui-content-information" v-else><Spin fix></Spin></div>
    </Drawer>
</template>
<style lang="less">
    .m-ui-content-information {
        position: relative;
        overflow-y: auto;
        min-height: 150px;
        height: 100%;
        .m-ui-gu-gi {
            margin-bottom: 10px;
            .m-ui-gu-row {
                padding: 6px 0;
            }
        }
        .m-ui-group-user-bottom {
            position: absolute;
            bottom: 0px;
            width: 100%;
        }
    }
</style>