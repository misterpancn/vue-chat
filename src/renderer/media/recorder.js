import Recorder from 'recorderjs'
const rec = {
  isSupport: true,
  audioContent: null,
  recorder: null
}
rec.init = function (call) {
  try {
    window.URL = window.URL || window.webkitURL;
    this.audioContent = new (window.AudioContext || window.webkitAudioContext)()
  } catch (e) {
    console.log(e.message)
  }
  this.getUserMedia({audio: true}, this.startUserMedia, function (e) {
    rec.isSupport = false
    call(e)
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
  this.createDownloadLink()
  this.recorder.clear()
}
rec.createDownloadLink = function () {
  this.recorder && this.recorder.exportWAV(function (blob) {
    console.log(blob)
    var url = URL.createObjectURL(blob);
    var au = document.createElement('audio');
    var hf = document.createElement('a');

    au.controls = true;
    au.src = url;
    hf.href = url;
    hf.download = new Date().toISOString() + '.wav';
    URL.revokeObjectURL(url)
  });
}
export default rec
