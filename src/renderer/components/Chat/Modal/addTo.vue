<script>
  import axios from '@/request'
  export default {
    data () {
      return {
        data: null,
        lang: {}
      }
    },
    computed: {
      show: {
        get: function () {
          if (this.$store.getters.getAddToShow) {
            this.$Spin.hide();
          }
          return this.$store.getters.getAddToShow
        },
        set: function (val) {
          this.$store.dispatch('upAddToShow', val)
        }
      }
    },
    methods: {
      addFriends () {
        if (!this.data.is_related) {
          let da = this.data.is_group ? {group_id: this.data.group_id} : {friend_id: this.data.id}
          axios.addFriends(da).then((r) => {
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
      },
      search (n) {
        axios.searchNo({chat_number: n}).then((r) => {
          this.data = r.data.data;
        }).catch((e) => {
          this.$Message.warning({
            content: e.response.data.data,
            duration: 3
          });
        })
      },
      trimStr (data) {
        if (data.is_related) {
          return data.is_group ? this.$t('chat.alreadyInTheGroup') : this.$t('chat.hasBeenFriend')
        }
      },
      close () {
        this.data = null
      }
    }
  }
</script>
<template>
    <Modal v-model="show" :mask-closable="false" footer-hide @on-cancel="close">
        <p slot="header" style="text-align: center;">{{ $t('chat.FindGroupOrUser') }}</p>
        <div class="m-ui-content">
            <Input search enter-button placeholder="Enter something..." @on-search="search" />
            <Card v-if="data" style="width: 100%; margin-top: 20px">
                <Layout style="background: none" v-if="data">
                    <Sider class="left-content">
                        <img height="120" width="120" :src="data.photo" style="margin: 10px 30px" />
                    </Sider>
                    <Layout style="background: none; margin-left: 10px; margin-top: 10px">
                        <Row>
                            <Col :xs="10" :sm="10" :md="6" :lg="8" class="m-col">{{!data.is_group ? $t('account.username') : $t('chat.groupName')}}</Col>
                            <Col :xs="12" :sm="10" :md="12" :lg="8" class="m-col">{{ data.is_group ? data.group_name : data.name }}</Col>
                        </Row>
                        <Row v-if="!data.is_group">
                            <Col :xs="10" :sm="10" :md="6" :lg="8" class="m-col">{{$t('account.email')}}</Col>
                            <Col :xs="12" :sm="10" :md="12" :lg="8" class="m-col">{{ data.email }}</Col>
                        </Row>
                        <Row>
                            <Col :xs="10" :sm="10" :md="6" :lg="8" class="m-col">{{$t('account.registerTime')}}</Col>
                            <Col :xs="12" :sm="10" :md="12" :lg="8" class="m-col">{{ data.created_at }}</Col>
                        </Row>
                        <Row v-if="data.is_self">
                            <Col :xs="10" :sm="10" :md="6" :lg="8" class="m-col">{{$t('account.mobileNumber')}}</Col>
                            <Col :xs="12" :sm="10" :md="12" :lg="8" class="m-col">{{ data.mb_prefix + data.phone }}</Col>
                        </Row>
                        <Row v-if="!data.is_self">
                            <Col :xs="10" :sm="10" :md="6" :lg="8" class="m-col">{{$t('chat.addFriends')}}</Col>
                            <Col :xs="12" :sm="10" :md="12" :lg="8" class="m-col" v-if="data.is_related">{{ trimStr(data) }}</Col>
                            <Col :xs="10" :sm="10" :md="6" :lg="8" class="m-col" v-else>
                            <Icon type="md-add-circle" :title="$t('chat.addFriends')" size="20" style="cursor: pointer" @click="addFriends" />
                            </Col>
                        </Row>
                    </Layout>
                </Layout>
            </Card>
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