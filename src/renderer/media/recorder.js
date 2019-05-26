import Recorder from '@/media/recorderjs/recorder.js'
import fs from 'fs'
const rec = {
  isSupport: true,
  audioContent: null,
  recorder: null,
  callback: {}
}
rec.init = function (call) {
  try {
    // webkit shim
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.mediaDevices.getUserMedia;
    window.URL = window.URL || window.webkitURL;

    rec.audioContent = new AudioContext();
  } catch (e) {
    console.log(e.message)
  }
  rec.callback = call
  navigator.getUserMedia({audio: true}, this.startUserMedia, function (e) {
    rec.isSupport = false
    rec.audioContent.close();
    if (rec.recorder !== null) {
      rec.recorder.clear()
    }
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

    // input.connect(rec.audioContent.destination);

    rec.recorder = new Recorder(input);
  }
}
rec.startRecording = function () {
  rec.audioContent.resume().then(() => {
    console.log('playback resumed successfully')
  }).catch((err) => {
    rec.callback(err)
  })
  rec.recorder && rec.recorder.record()
}
rec.stopRecording = function () {
  rec.recorder && rec.recorder.stop();
  rec.createDownloadLink();
  rec.recorder.clear();
}
rec.createDownloadLink = function () {
  rec.recorder && rec.recorder.exportWAV(function (blob) {
    console.log(blob)
    rec.blobToBase64(blob, function (base64) {
      var buf = Buffer.from(base64, 'base64'); // decode
      fs.writeFile(`${__dirname}/` + '../../../static/audio/aaa.wav', buf, 'binary', (err) => {
        rec.callback(err)
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
rec.blobToBase64 = function (blob, cb) {
  var reader = new FileReader();
  reader.onload = function () {
    var dataUrl = reader.result;
    var base64 = dataUrl.split(',')[1];
    cb(base64);
  };
  reader.readAsDataURL(blob);
};
rec.closeAudio = function () {
  if (rec.audioContent) {
    rec.audioContent.close()
  }
}
export default rec
