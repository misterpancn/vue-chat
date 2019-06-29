<script>
  import config from '@/store/config/config'
  export default {
    data () {
      return {
        loading: false,
        transport: config.openssl === false ? 'http://' : 'https://',
        uploadLink: config.serviceAddress + '/api/media/upload/imgToBase64',
        headers: {
          'Accept': 'application/' + config.apiVersion + '+json',
          'Custom-Token': config.clientKey,
          'Authorization': localStorage.getItem('tokenType') + ' ' + localStorage.getItem('token')
        },
        imgUrl: '',
        imgShow: false
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
            this.imgShow = false
          }
        }
      }
    },
    methods: {
      handleSuccess (res, file) {
        this.imgUrl = res.data
        this.imgShow = true
        console.log(res)
        console.log(file)
      },
      handleFormatError (file) {
        this.$Notice.warning({
          title: 'The file format is incorrect',
          desc: 'File format of ' + file.name + ' is incorrect, please select jpg or png.'
        });
      },
      handleMaxSize (file) {
        this.$Notice.warning({
          title: 'Exceeding file size limit',
          desc: 'File  ' + file.name + ' is too large, no more than 2M.'
        });
      }
    }
  }
</script>
<template>
    <Modal v-model="show" :mask-closable="false" footer-hide>
        <p slot="header" style="text-align: center;">{{ $t('account.modifyAvatar') }}</p>
        <div v-if="!imgShow" class="m-ui-content">
            <Upload
                    :headers="headers"
                    :on-success="handleSuccess"
                    :format="['jpg','jpeg','png', 'gif']"
                    :max-size="2048"
                    :on-format-error="handleFormatError"
                    :on-exceeded-size="handleMaxSize"
                    type="drag"
                    name="img"
                    :action="transport + uploadLink">
                <div style="padding: 20px 0">
                    <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                    <p>Click or drag files here to upload</p>
                </div>
            </Upload>
        </div>
        <div v-else class="m-ui-content" style="text-align: center">
            <img :src="imgUrl">
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