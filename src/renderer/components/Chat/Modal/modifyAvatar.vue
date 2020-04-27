<script>
  import config from '@/store/config/config'
  export default {
    data () {
      return {
        loading: false,
        transport: config.openssl === false ? 'http://' : 'https://',
        uploadLink: config.serviceAddress + '/api/media/upload/imgToBase64',
        imgUrl: '',
        imgPath: '',
        imgShow: false,
        postParam: {is_save: 1}
      }
    },
    computed: {
      show: {
        get: function () {
          return this.$store.getters.getModifyAvatarShow
        },
        set: function (val) {
          this.$store.dispatch('setModifyAvatarShow', val)
          if (!val) {
            this.cancel()
          }
        }
      },
      headers () {
        let keys = config.encrypt()
        return {
          'Accept': 'application/' + config.apiVersion + '+json',
          'Client-Key': keys.key,
          'Secret-Salt': keys.salt,
          'Authorization': localStorage.getItem('tokenType') + ' ' + localStorage.getItem('token')
        }
      }
    },
    methods: {
      handleSuccess (res, file) {
        this.imgUrl = res.data.img_url
        this.imgPath = res.data.img_path
        this.imgShow = true
      },
      handleFormatError (file) {
        this.$Notice.warning({
          title: this.$t('notifyTitle.fileFormatIsIncorrect'),
          desc: this.$t('notify.imgFileFormatIsIncorrectMes', {fileName: file.name})
        });
      },
      handleMaxSize (file) {
        this.$Notice.warning({
          title: this.$t('notifyTitle.exceedingFileSizeLimit'),
          desc: this.$t('notify.exceedingImageFileSizeLimitMes', {fileName: file.name, size: '2M'})
        });
      },
      cancel () {
        this.imgShow = false
        if (this.imgPath) {
          this.$store.dispatch('deleteTempAvatar', {img_path: this.imgPath})
        }
        this.imgPath = ''
        this.imgUrl = ''
      },
      uploadAvatar () {
        this.loading = true
        this.$store.dispatch('saveTempAvatar', {img_path: this.imgPath}).then((r) => {
          this.$store.dispatch('me')
          this.imgPath = ''
          this.show = false
          this.loading = false
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
      }
    }
  }
</script>
<template>
    <Modal v-model="show" :mask-closable="false" :footer-hide="!imgShow">
        <p slot="header" style="text-align: center;">{{ $t('account.modifyAvatar') }}</p>
        <div v-if="!imgShow" class="m-ui-content">
            <Upload
                    :headers="headers"
                    :on-success="handleSuccess"
                    :format="['jpg','jpeg','png', 'gif']"
                    :max-size="2048"
                    :on-format-error="handleFormatError"
                    :on-exceeded-size="handleMaxSize"
                    :data="postParam"
                    type="drag"
                    name="img"
                    :action="transport + uploadLink">
                <div style="padding: 20px 0">
                    <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                    <p>{{$t('chat.notify.clickOrDragFile')}}</p>
                </div>
            </Upload>
        </div>
        <div v-else class="m-ui-content" style="text-align: center">
            <img :src="imgUrl" width="50%">
        </div>
        <div slot="footer">
            <p style="margin-bottom: 10px"><Button type="warning" size="large" long @click="cancel">{{$t('operation.reSelection')}}</Button></p>
            <p><Button type="success" size="large" :loading="loading" long @click="uploadAvatar" >{{$t('operation.sureToModify')}}</Button></p>
        </div>
    </Modal>
</template>
<style lang="less">
    .m-ui-content {
        position: relative;
        .left-content {
            height: 100%;
            background: none;
        }
    }
</style>