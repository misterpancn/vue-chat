<script>
    import messageItem from './../messageItem'
    export default {
      components: { messageItem },
      data () {
        return {
          message: null
        }
      },
      computed: {
        show: {
          get: function () {
            if (this.$store.getters.getMessageHistoryShow && this.message === null) {
              this.getMessage(1)
            }
            return this.$store.getters.getMessageHistoryShow
          },
          set: function (val) {
            this.$store.dispatch('setMessageHistory', val)
          }
        },
        selectId () {
          return this.$store.getters.selectId
        },
        isGroup () {
          return this.$store.getters.isGroup
        }
      },
      watch: {
        selectId (val) {
          this.message = null
        },
        isGroup (val) {
          this.message = null
        }
      },
      methods: {
        changePage (page) {
          this.getMessage(page)
        },
        getMessage (page) {
          this.$store.dispatch('getMessage', {
            selectId: this.selectId,
            isGroup: this.isGroup,
            users: this.$store.getters.getUser,
            limit: 15,
            saveLocal: false,
            page: page
          }).then((res) => {
            this.message = res.data.data
          }).catch((e) => {
            this.$Message.warning({
              content: this.$t('notifyTitle.errorOccurred'),
              duration: 3
            });
          })
        }
      }
    }
</script>
<template>
    <Modal v-model="show" :mask-closable="false" :styles="{top: '50px'}">
        <p slot="header" style="text-align: center;">{{ $t('chat.messageHistory') }}</p>
        <div class="m-ui-content-message" v-if="message">
            <Row v-for="item in message.data" :key="item.id">
                <p>
                    <span style="margin-right: 10px;"><b>{{item.user_name}}</b></span>
                    <span style="color: darkturquoise"><Time :time="item.time * 1000" type="datetime" /></span>
                </p>
                <message-item v-bind:item="item"></message-item>
            </Row>
        </div>
        <div v-else class="m-ui-content-message"><Spin fix></Spin></div>
        <div slot="footer" v-if="message">
            <Page :total="message.total" :current="message.current_page" :page-size="parseInt(message.per_page)" @on-change="changePage" size="small" show-elevator show-total />
        </div>
        <div v-else slot="footer"><Spin fix></Spin></div>
    </Modal>
</template>
<style lang="less">
    .m-ui-content-message {
        position: relative;
        overflow: auto;
        max-height: calc(100vh - 250px);
        min-height: 100px;
        font-size: 12px;
        .m-mess-modal {
            background: none;
            width: 100% !important;
        }
    }
</style>