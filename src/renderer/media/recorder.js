import Recorder from '@/media/recorderjs/recordmp3.js'
import store from '@/store'
import log from 'electron-log'
log.transports.console.level = 'silly';
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
rec.startUserMedia = function (stream) {
  if (rec.audioContent !== undefined) {
    var input = rec.audioContent.createMediaStreamSource(stream);

    // input.connect(rec.audioContent.destination);

    rec.recorder = new Recorder(input);
  }
}
rec.startRecording = function () {
  rec.audioContent.resume().then(() => {
    rec.callback('playback resumed successfully')
  }).catch((err) => {
    rec.callback(err)
    log.error(err)
  })
  rec.recorder && rec.recorder.record()
}
rec.stopRecording = function (isSend, obj) {
  rec.recorder && rec.recorder.stop();
  rec.createDownloadLink(isSend, obj);
  rec.recorder.clear();
}
rec.createDownloadLink = function (isSend, obj) {
  rec.recorder && rec.recorder.exportMP3(function (blob) {
    rec.callback('Blob size: ' + blob.size)
    /* rec.blobToBase64(blob, function (base64) {
      var buf = Buffer.from(base64, 'base64'); // decode
      fs.writeFile(`${__dirname}/` + '../../../static/audio/aaa.wav', buf, 'binary', (err) => {
        rec.callback(err)
      })
    }) */
    if (isSend && blob.size > 0) {
      let formData = new FormData();
      formData.append('media', blob)
      if (!obj.isGroup) {
        store.dispatch('chatSendRecorder', {
          id: obj.selectId,
          form_data: formData
        })
      } else {
        store.dispatch('groupSendRecorder', {
          id: obj.selectId,
          form_data: formData
        })
      }
    }
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
  if (rec.audioContent && rec.audioContent.state !== 'closed') {
    rec.audioContent.close()
    rec.recorder.closeConnect()
    rec.recorder.clear()
  }
}
export default rec
