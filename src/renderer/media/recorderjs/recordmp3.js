import mp3 from './../worker/mp3'
var Recorder = function (source, cfg) {
  var config = cfg || {};
  var bufferLen = config.bufferLen || 4096;
  this.context = source.context;
  this.node = (this.context.createScriptProcessor ||
  this.context.createJavaScriptNode).call(this.context,
    bufferLen, 2, 2); // 缓冲区大小  声道数
  var worker = mp3.create();
  /* worker.onmessage = function (e) {
    var blob = e.data;
    if (currCallback) currCallback(blob);
  }

  worker.postMessage({
    cmd: 'init',
    config: {
      sampleRate: this.context.sampleRate || 44100, // 采样率
      bitRate: config.bitRate || 128 // 比特率 mp3 128kbps
    }
  }); */
  worker.postMessage('init')
  var recording = false;
  var currCallback;

  this.node.onaudioprocess = function (e) {
    if (!recording) return;
    let buf = [
      e.inputBuffer.getChannelData(0),
      e.inputBuffer.getChannelData(1)
    ]
    worker.postMessage('encode', [buf])
    /* worker.postMessage({
      cmd: 'encode',
      buf: [
        e.inputBuffer.getChannelData(0),
        e.inputBuffer.getChannelData(1)
      ]
    }); */
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

  this.clear = function () {
    worker.postMessage('clear');
  }

  this.getBuffer = function (cb) {
    currCallback = cb || config.callback;
    worker.postMessage('getBuffer')
  }

  this.exportMP3 = function (cb) {
    currCallback = cb || config.callback;
    if (!currCallback) throw new Error('Callback not set');
    worker.callback = currCallback
    worker.postMessage('finish');
  }

  source.connect(this.node);
  this.node.connect(this.context.destination); // this should not be necessary
};
export default Recorder
