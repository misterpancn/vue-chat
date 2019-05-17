import Recorder from '@/media/recorderjs/recorder.js'
import fs from 'fs'
const rec = {
  isSupport: true,
  audioContent: null,
  recorder: null
}
rec.init = function (call) {
  try {
    window.URL = window.URL || window.webkitURL;
    rec.audioContent = new (window.AudioContext || window.webkitAudioContext)()
  } catch (e) {
    console.log(e.message)
  }
  this.getUserMedia({audio: true}, this.startUserMedia, function (e) {
    rec.isSupport = false
    rec.audioContent.close();
    rec.recorder.clear()
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
  if (rec.audioContent !== undefined) {
    var input = rec.audioContent.createMediaStreamSource(stream);

    input.connect(rec.audioContent.destination);

    rec.recorder = new Recorder(input);
  }
}
rec.startRecording = function () {
  rec.audioContent.resume().then(() => {
    console.log('playback resumed successfully')
  }).catch((err) => {
    console.log(err)
  })
  rec.recorder && rec.recorder.record()
}
rec.stopRecording = function () {
  rec.recorder && rec.recorder.stop();
  rec.createDownloadLink();
  rec.recorder.clear();
  rec.audioContent.close();
  rec.recorder = null;
  rec.audioContent = null;
}
rec.createDownloadLink = function () {
  rec.recorder && rec.recorder.exportWAV(function (blob) {
    console.log(blob)
    blobToBase64(blob, function (base64) {
      var buf = Buffer.from(base64, 'base64'); // decode
      fs.writeFile(`${__dirname}/` + 'audio/aaa.wav', buf, 'binary', (err) => {
        console.log(err)
      })
    })
    var url = URL.createObjectURL(blob);
    console.log(url);
    var au = document.createElement('audio');
    var hf = document.createElement('a');

    au.controls = true;
    au.src = url;
    hf.href = url;
    hf.download = new Date().toISOString() + '.wav';
    URL.revokeObjectURL(url)
  });
}
var blobToBase64 = function (blob, cb) {
  var reader = new FileReader();
  reader.onload = function () {
    var dataUrl = reader.result;
    var base64 = dataUrl.split(',')[1];
    cb(base64);
  };
  reader.readAsDataURL(blob);
};
export default rec
