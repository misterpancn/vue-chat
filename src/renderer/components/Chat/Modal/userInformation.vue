<script>
    import axios from '@/request'
    export default {
      data () {
        return {
          photo: this.$store.getters.getUser.photo,
          panel: ['1', '2']
        }
      },
      computed: {
        show: {
          get: function () {
            if (this.$store.getters.getModalStatus) {
              this.$Spin.hide();
            }
            return this.$store.getters.getModalStatus
          },
          set: function (val) {
            this.$store.dispatch('setModalStatus', val)
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
            axios.addFriends({friend_id: uid}).then((r) => {
              this.$Message.warning({
                content: this.$t('notify.applicationHasBeenSent'),
                duration: 3
              });
            }).catch((e) => {
              this.$Message.warning({
                content: e.response.data.data,
                duration: 3
              });
            })
          }
        }
      }
    }
</script>
<template>
    <Modal v-model="show" :mask-closable="false" footer-hide>
        <p slot="header" style="text-align: center;">{{ $t('account.information') }}</p>
        <div class="m-ui-content">
            <Layout style="background: none" v-if="userInfo">
                <Sider class="left-content">
                    <img height="120" width="120" :src="photo" style="margin: 10px 30px" />
                    <Divider orientation="left">{{$t('chat.chatId')}}：</Divider>
                    <Divider orientation="right" size="small">{{userInfo.chat_number}}</Divider>
                </Sider>
                <Layout style="background: none; margin-left: 10px">
                    <Collapse v-model="panel" simple>
                        <Panel name="1">
                            {{$t('account.personalInformation')}}
                            <div slot="content">
                                <Row>
                                    <Col :xs="10" :sm="10" :md="6" :lg="8" class="m-col">{{$t('account.username')}}</Col>
                                    <Col :xs="12" :sm="10" :md="12" :lg="8" class="m-col">{{ userInfo.name }}</Col>
                                </Row>
                                <Row>
                                    <Col :xs="10" :sm="10" :md="6" :lg="8" class="m-col">{{$t('account.email')}}</Col>
                                    <Col :xs="12" :sm="10" :md="12" :lg="8" class="m-col">{{ userInfo.email }}</Col>
                                </Row>
                                <Row>
                                    <Col :xs="10" :sm="10" :md="6" :lg="8" class="m-col">{{$t('account.mobileNumber')}}</Col>
                                    <Col :xs="12" :sm="10" :md="12" :lg="8" class="m-col">{{ userInfo.mb_prefix + userInfo.phone }}</Col>
                                </Row>
                                <Row>
                                    <Col :xs="10" :sm="10" :md="6" :lg="8" class="m-col">{{$t('account.registerTime')}}</Col>
                                    <Col :xs="12" :sm="10" :md="12" :lg="8" class="m-col">{{ userInfo.created_at }}</Col>
                                </Row>
                            </div>
                        </Panel>
                        <Panel name="2">
                            {{$t('chat.operation')}}
                            <div slot="content">
                                <Row>
                                    <Col :xs="10" :sm="10" :md="6" :lg="8" class="m-col">
                                    <Button shape="circle" size="small" icon="ios-add-circle" style="font-size: 1.2em" :title="$t('chat.addFriends')"
                                    @click="addFriends"></Button>
                                    </Col>
                                </Row>
                            </div>
                        </Panel>
                    </Collapse>
                </Layout>
            </Layout>
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