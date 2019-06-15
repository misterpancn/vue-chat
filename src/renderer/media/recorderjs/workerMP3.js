(function () {
  'use strict';

  const lamejs = require('lamejs');

  var mp3Encoder, maxSamples = 1152, lame, config, dataBuffer;
  var clearBuffer = function () {
    dataBuffer = [];
  };

  var appendToBuffer = function (mp3Buf) {
    dataBuffer.push(new Int8Array(mp3Buf));
  };


  var init = function (prefConfig) {
    config = prefConfig || {};
    lame = new lamejs();
    mp3Encoder = new lame.Mp3Encoder(2, config.sampleRate || 44100, config.bitRate || 128);
    clearBuffer();
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
    self.postMessage(dataBuffer);
    clearBuffer();
  };

  self.onmessage = function (e) {
    switch (e.data.cmd) {
      case 'init':
        init(e.data.config);
        break;
      case 'encode':
        encode(e.data.buf);
        break;
      case 'finish':
        finish();
        break;
    }
  };
})();
