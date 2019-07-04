import VueWorker from 'vue-worker'
import Lame from 'lamejs'
export default {
  worker: null,
  mp3Encoder: null,
  maxSamples: 1152,
  dataBuffer: [],
  config: {
    channels: 2,
    sampleRate: 44100,
    bitRate: 128
  },
  create: () => {
    let action = [
      {message: 'init', func: this.init},
      {message: 'encode', func: this.encode},
      {message: 'finish', func: this.finish},
      {message: 'clear', func: this.destroyed}
    ];
    this.worker = VueWorker.create(action)
    return this.worker
  },
  init: () => {
    this.mp3Encoder = new Lame.Mp3Encoder(this.config.channels, this.config.sampleRate, this.config.bitRate)
    this.clearBuffer()
  },
  clearBuffer: () => {
    this.dataBuffer = []
  },
  appendToBuffer: (mp3Buf) => {
    this.dataBuffer.push(new Int8Array(mp3Buf));
  },
  floatTo16BitPCM: (input, output) => {
    for (var i = 0; i < input.length; i++) {
      var s = Math.max(-1, Math.min(1, input[i]));
      output[i] = (s < 0 ? s * 0x8000 : s * 0x7FFF);
    }
  },
  convertBuffer: (arrayBuffer) => {
    var data = new Float32Array(arrayBuffer);
    var out = new Int16Array(arrayBuffer.length);
    this.floatTo16BitPCM(data, out)
    return out;
  },
  encode: (arrayBuffer) => {
    let samplesLeft = this.convertBuffer(arrayBuffer[0]);
    let samplesRight = arrayBuffer.length > 1 ? this.convertBuffer(arrayBuffer[1]) : undefined;
    var remaining = samplesLeft.length;
    for (var i = 0; remaining >= 0; i += this.maxSamples) {
      var left = samplesLeft.subarray(i, i + this.maxSamples);
      let right = samplesRight ? samplesRight.subarray(i, i + this.maxSamples) : undefined
      var mp3buf = this.mp3Encoder.encodeBuffer(left, right);
      this.appendToBuffer(mp3buf);
      remaining -= this.maxSamples;
    }
  },
  finish: () => {
    this.appendToBuffer(this.mp3Encoder.flush());
    this.callback(new Blob(this.dataBuffer, { type: 'audio/mp3' }));
    this.clearBuffer();
  },
  callback: () => {},
  destroyed: () => {
    this.worker = null
  }
}
