<script>
    import {remote, ipcRenderer} from 'electron'
    export default {
      data () {
        return {
          downloading: false,
          showModal: false,
          updateInfo: {},
          updateAvailable: false,
          packSize: 0,
          downloadPercent: 0,
          updateDownloaded: false,
          downloadStatus: 'active'
        }
      },
      computed: {
        currentVersion () {
          return remote.app.getVersion()
        }
      },
      methods: {
        checkForUpdate () {
          if (this.updateAvailable) {
            this.showModal = true
          } else {
            this.$Message.success({content: this.$t('system.isTheLatestVersion'), duration: 3})
          }
        },
        downloadPack () {
          this.downloading = true
          ipcRenderer.send('update-download')
        },
        install () {
          ipcRenderer.send('update-install')
          this.updateAvailable = false
          this.updateDownloaded = false
        }

      },
      created () {
        ipcRenderer.on('update-error', (e, error) => {
          console.log(error)
          this.$Message.error({content: error, duration: 3})
        })
        ipcRenderer.on('update-available', (event, info) => {
          this.updateInfo = info
          this.updateAvailable = true
        })
        ipcRenderer.on('update-not-available', (event, info) => {
          this.updateInfo = info
          this.updateAvailable = false
        })
        ipcRenderer.on('update-download-progress', (event, progress) => {
          this.packSize = Math.round(progress.total / 1024 / 1024)
          this.downloadPercent = Math.round(progress.percent) || 0
        })
        ipcRenderer.on('update-downloaded', () => {
          this.updateDownloaded = true
        })
        ipcRenderer.send('check-for-update')
      },
      destroyed () {
        ipcRenderer.removeAllListeners([
          'update-error', 'update-available', 'update-not-available', 'update-download-progress', 'update-downloaded'
        ])
      }
    }
</script>
<template>
    <div>
        <Badge :dot="updateAvailable" style="width: 100%">
            <Button @click="checkForUpdate" type="success" long>{{ $t('system.checkForUpdate') }}</Button>
        </Badge>
        <Modal v-model="showModal" :mask-closable="false">
            <p slot="header" style="text-align: center;">{{ $t('system.checkForUpdate') }}</p>
            <div class="m-ui-content">
                <Row class="m-row">
                    <Col span="6">{{$t('system.currentVersion')}}</Col>
                    <Col span="18">{{currentVersion}}</Col>
                </Row>
                <Row class="m-row" v-if="updateInfo.version">
                    <Col span="6">{{$t('system.latestVersion')}}</Col>
                    <Col span="18">{{updateInfo.version}}</Col>
                </Row>
                <Row class="m-row" v-if="updateInfo.releaseDate">
                    <Col span="6">{{$t('system.releaseTime')}}</Col>
                    <Col span="18">{{updateInfo.releaseDate}}</Col>
                </Row>
                <Row class="m-row" v-if="packSize">
                    <Col span="6">{{$t('system.packageSize')}}</Col>
                    <Col span="18">{{packSize}}M</Col>
                </Row>
                <Row class="m-row" v-if="downloadPercent">
                    <Col><Progress :percent="downloadPercent" :status="downloadStatus" /></Col>
                </Row>
            </div>
            <div slot="footer">
                <Button type="primary" v-if="!updateDownloaded" @click="downloadPack"
                        :disabled="!updateAvailable" :loading="downloading" long>{{$t('system.download')}}</Button>
                <Button type="success" v-if="updateDownloaded" @click="install" long>{{$t('system.install')}}</Button>
            </div>
        </Modal>
    </div>
</template>
<style lang="less">
    .m-ui-content {
        position: relative;
        font-size: 14px;
        .m-row {
            padding: 10px;
        }
    }
</style>