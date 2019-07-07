import WangEdit from 'wangeditor'
var wangEdit = {
  headers: {},
  uploadLink: null,
  editor: {},
  init (conf) {
    this.headers = conf.headers
    this.uploadLink = conf.uploadLink
    this.editor = new WangEdit(conf.menu, conf.cont)
    this.editor.customConfig.menus = []
    this.editor.customConfig.zIndex = 1
    this.editor.customConfig.pasteFilterStyle = true
    this.editor.customConfig.uploadImgMaxSize = 2 * 1024 * 1024
    this.editor.customConfig.uploadImgMaxLength = 1
    this.editor.customConfig.uploadImgHeaders = this.headers
    this.editor.customConfig.uploadFileName = conf.filename || 'img'
    this.editor.customConfig.uploadImgParams = {is_save: 0}
    // this.editor.customConfig.pasteUrl = 'http://reconsitutionfs.com/api/media/upload/recorder/chat/1'
    this.editor.customConfig.uploadImgServer = this.uploadLink
  }
};
export default wangEdit
