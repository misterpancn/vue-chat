// import log from 'electron-log'
import Lamejs from 'lamejs'
// log.transports.console.level = 'silly';

var Recorder = function (source, cfg) {
  var config = cfg || {};
  var bufferLen = config.bufferLen || 4096;
  var mp3Encoder;
  var maxSamples = 1152;
  var dataBuffer = [];
  this.context = source.context;
  this.node = (this.context.createScriptProcessor ||
  this.context.createJavaScriptNode).call(this.context,
    bufferLen, 2, 2); // 缓冲区大小  声道数
  var set = {
    sampleRate: this.context.sampleRate || 44100, // 采样率
    bitRate: config.bitRate || 128 // 比特率 mp3 128kbps
  }
  mp3Encoder = new Lamejs.Mp3Encoder(2, set.sampleRate || 44100, set.bitRate || 128);
  dataBuffer = [];
  var recording = false;
  var currCallback;

  this.node.onaudioprocess = function (e) {
    if (!recording) return;
    encode([
      e.inputBuffer.getChannelData(0),
      e.inputBuffer.getChannelData(1)
    ])
  }

  this.configure = function (cfg) {
    for (var prop in cfg) {
      if (cfg.hasOwnProperty(prop)) {
        config[prop] = cfg[prop];
      }
    }
  }

  this.record = function () {
    recording = true;
  }

  this.stop = function () {
    recording = false;
  }
  this.closeConnect = () => {
    recording = false;
    if (source) source.disconnect()
    if (this.node) this.node.disconnect()
  }

  this.exportMP3 = function (cb) {
    currCallback = cb || config.callback;
    if (!currCallback) throw new Error('Callback not set');
    finish()
  }
  this.clear = () => {
    clearBuffer()
  }
  var clearBuffer = function () {
    dataBuffer = [];
  };

  var appendToBuffer = function (mp3Buf) {
    dataBuffer.push(new Int8Array(mp3Buf));
  };


  var floatTo16BitPCM = function floatTo16BitPCM (input, output) {
    for (var i = 0; i < input.length; i++) {
      var s = Math.max(-1, Math.min(1, input[i]));
      output[i] = (s < 0 ? s * 0x8000 : s * 0x7FFF);
    }
  };

  var convertBuffer = function (arrayBuffer) {
    var data = new Float32Array(arrayBuffer);
    var out = new Int16Array(arrayBuffer.length);
    floatTo16BitPCM(data, out)
    return out;
  };

  var encode = function (arrayBuffer) {
    let samplesLeft = convertBuffer(arrayBuffer[0]);
    let samplesRight = arrayBuffer.length > 1 ? convertBuffer(arrayBuffer[1]) : undefined;
    var remaining = samplesLeft.length;
    for (var i = 0; remaining >= 0; i += maxSamples) {
      var left = samplesLeft.subarray(i, i + maxSamples);
      let right = samplesRight ? samplesRight.subarray(i, i + maxSamples) : undefined
      var mp3buf = mp3Encoder.encodeBuffer(left, right);
      appendToBuffer(mp3buf);
      remaining -= maxSamples;
    }
  };

  var finish = function () {
    appendToBuffer(mp3Encoder.flush());
    currCallback(new Blob(dataBuffer, { type: 'audio/mp3' }));
    clearBuffer();
  };

  source.connect(this.node);
  this.node.connect(this.context.destination); // this should not be necessary
};

export default Recorder;
