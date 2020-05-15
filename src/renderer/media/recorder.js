import Recorder from 'recorderjs'
const rec = {
  isSupport: true,
  audioContent: null,
  recorder: null
}
rec.init = function () {
  this.audioContent = new (window.AudioContext || window.webkitAudioContext)()
  this.getUserMedia({audio: true}, this.startUserMedia, function (e) {
    rec.isSupport = false
    console.log(e)
  })
}
rec.getUserMedia = function (constrains, success, error) {
  if (navigator.mediaDevices.getUserMedia) {
    // 最新标准API
    navigator.mediaDevices.getUserMedia(constrains).then(success).catch(error)
  } else if (navigator.webkitGetUserMedia) {
    // webkit内核浏览器
    navigator.webkitGetUserMedia(constrains).then(success).catch(error)
  } else if (navigator.mozGetUserMedia) {
    // Firefox浏览器
    navigator.mozGetUserMedia(constrains).then(success).catch(error)
  } else if (navigator.getUserMedia) {
    // 旧版API
    navigator.getUserMedia(constrains).then(success).catch(error)
  }
}
rec.startUserMedia = function (stream) {
  var input = this.audioContent.createMediaStreamSource(stream);

  input.connect(this.audioContent.destination);

  this.recorder = new Recorder(input);
}
rec.startRecording = function () {
  this.recorder && this.recorder.record()
}
rec.stopRecording = function () {
  this.recorder && this.recorder.stop()
}
export default rec
