<script>
  import axios from '@/request'
  import Vue from 'vue'
  export default {
    data () {
      return {
        loading: false
      }
    },
    computed: {
      notify () {
        return this.$store.getters.getNotifyList
      }
    },
    methods: {
      post (id, audit) {
        axios.audit(id, {audit: audit}).then((r) => {
          this.$store.dispatch('updateNotifyList', {id: id, audit: audit})
          // 审核通过之后返回新的好友列表  更新本地数据
          if (audit === 1 && r.data.status_code === 200 && r.data.data.friend_list) {
            this.$store.dispatch('setUserList', r.data.data.friend_list)
          }
          this.$Modal.remove()
          this.$Message.success({
            content: this.$t('notify.successOperation'),
            duration: 3
          });
        }).catch((error) => {
          this.$Message.warning({
            content: error.response.data.data,
            duration: 3
          });
          this.$Modal.remove()
        })
      },
      audit (id, audit) {
        this.$Modal.confirm({
          title: this.$t('notify.haveConfirmOperation'),
          loading: true,
          onOk: () => {
            this.post(id, audit)
          }
        })
      },
      timeType (date) {
        date = new Date(parseInt(date) * 1000)
        if (new Date().getTime() - date.getTime() > 5 * 1000) {
          return 'datetime'
        } else {
          return 'relative'
        }
      },
      time (date) {
        date = new Date(parseInt(date) * 1000)
        return date.getTime()
      }
    },
    directives: {
      // 发送消息后滚动到底部
      'scroll-bottom' (el) {
        Vue.nextTick(() => {
          el.scrollTop = el.scrollHeight - el.clientHeight
        })
      }
    }
  }
</script>
<template>
    <div class="m-notify" v-scroll-bottom="notify">
        <ul>
            <li v-for="item in notify">
                <p class="time"><span><Time :time="time(item.apply_time)" :type="timeType(item.apply_time)" /></span></p>
                <Card style="max-width: 800px;margin: 0 auto">
                    <p slot="title" style="text-align: center">{{ item.group_id > 0 ? $t('chat.groupApply') : $t('chat.friendApply') }}</p>
                    <Layout style="background: none">
                        <Sider class="left-content">
                            <img height="90" width="90" :src="item.photo" style="margin: 10px 30px" />
                        </Sider>
                        <Layout style="background: none; margin-left: 10px; margin-top: 10px">
                            <Row>
                                <Col :xs="10" :sm="8" :md="6" :lg="8" class="m-col">{{$t('account.username')}}</Col>
                                <Col :xs="12" :sm="12" :md="12" :lg="8" class="m-col">{{ (item.inviter ? item.inviter : item.user_name) }}</Col>
                            </Row>
                            <Row>
                                <Col :xs="10" :sm="8" :md="6" :lg="8" class="m-col">{{$t('chat.chatId')}}</Col>
                                <Col :xs="12" :sm="12" :md="12" :lg="8" class="m-col">{{ (item.inviter ? item.group_number : item.chat_number) }}</Col>
                            </Row>
                            <Row>
                                <Col :xs="10" :sm="8" :md="6" :lg="8" class="m-col">{{$t('chat.remarks')}}</Col>
                                <Col :xs="12" :sm="12" :md="12" :lg="8" class="m-col">{{ item.remarks }}</Col>
                            </Row>
                            <Row>
                                <Col :xs="10" :sm="8" :md="6" :lg="8" class="m-col">{{$t('chat.operation')}}</Col>
                                <Col :xs="12" :sm="12" :md="12" :lg="8" class="m-col" v-if="item.apply_status === 0">
                                <Button type="success" size="small" @click="audit(item.id, 1)" >{{$t('chat.agree')}}</Button>
                                <Button type="error" size="small" @click="audit(item.id, 2)" >{{$t('chat.refuse')}}</Button>
                                </Col>
                                <Col :xs="12" :sm="12" :md="12" :lg="8" class="m-col" v-else>{{item.apply_status ===1 ? $t('chat.passed') : $t('chat.rejected')}}</Col>
                            </Row>
                        </Layout>
                    </Layout>
                </Card>
            </li>
        </ul>
    </div>
</template>

<style lang="less">
    .m-notify {
        padding: 10px 15px;
        overflow-y: scroll;
        height: ~'calc(100% - 30px)';
        .left-content {
            height: 100%;
            background: none;
            .m-col {
                font-size: 21px;
                margin: 10px 0;
            }
        }
        li {
            margin-bottom: 15px;
        }
        .time {
            margin: 7px 0;
            text-align: center;

            > span {
                display: inline-block;
                padding: 0 18px;
                font-size: 12px;
                color: #fff;
                border-radius: 2px;
                background-color: #dcdcdc;
            }
        }
    }
</style>