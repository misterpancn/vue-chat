var WORKER_PATH = `${__dirname}` + '/workerMP3.js';

var Recorder = function (source, cfg) {
  var config = cfg || {};
  var bufferLen = config.bufferLen || 4096;
  this.context = source.context;
  this.node = (this.context.createScriptProcessor ||
  this.context.createJavaScriptNode).call(this.context,
    bufferLen, 2, 2); // 缓冲区大小  声道数
  var worker = new Worker(WORKER_PATH);
  worker.onmessage = function (e) {
    var blob = e.data;
    currCallback(blob);
  }

  worker.postMessage({
    command: 'init',
    config: {
      sampleRate: config.sampleRate || 44100, // 采样率
      bitRate: config.bitRate || 128 // 比特率 mp3 128kbps
    }
  });
  var recording = false;
  var currCallback;

  this.node.onaudioprocess = function (e) {
    if (!recording) return;
    worker.postMessage({
      cmd: 'encode',
      buf: [
        e.inputBuffer.getChannelData(0),
        e.inputBuffer.getChannelData(1)
      ]
    });
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
    if (source) source.disconnect()
    if (this.node) this.node.disconnect()
    if (worker) worker.stop()
  }

  this.clear = function () {
    worker.postMessage({command: 'clear'});
  }

  this.getBuffer = function (cb) {
    currCallback = cb || config.callback;
    worker.postMessage({command: 'getBuffer'})
  }

  this.exportMP3 = function (cb) {
    currCallback = cb || config.callback;
    if (!currCallback) throw new Error('Callback not set');
    worker.postMessage({
      command: 'finish'
    });
  }

  source.connect(this.node);
  this.node.connect(this.context.destination); // this should not be necessary
};

module.exports = Recorder;
