<script>
  import axios from '@/request'
  export default {
    data () {
      return {
        loading: false
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
          this.loading = true;
          axios.addFriends({friend_id: uid}).then((r) => {
            this.$Message.warning({
              content: this.$t('notify.applicationHasBeenSent'),
              duration: 3
            });
            this.loading = false;
          }).catch((e) => {
            this.$Message.warning({
              content: e.response.data.data,
              duration: 3
            });
            this.loading = false;
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