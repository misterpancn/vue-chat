import conf from '@/store/config/config'
const webrtc = {
  peer: null,
  error: '',
  isSetICE: false,
  subject: null,
  signaling: null,
  remoteVideoDom: null,
  localVideoDom: null,
  init: function () {
    let PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    if (!PeerConnection) {
      this.error = '设备不支持RTC功能'
      return false;
    }
    if (this.signaling.readyState !== WebSocket.OPEN) {
      this.error = 'signaling server not open'
      console.log(this.signaling.readyState)
      console.log(WebSocket.OPEN)
      return false;
    }
    let config = {iceServers: [
      {urls: 'turn:misterpan.cn', username: 'buck', credential: 'panwei123'}
    ]};
    this.peer = new PeerConnection(config);
    console.log(this.peer)
    this.peer.onicecandidate = (e) => {
      console.log(e)
      if (!e.candidate && this.isSetICE) {
        return this.handleAddCandidateError()
      }
      this.signaling.send(JSON.stringify({
        cmd: 'publish',
        subject: this.subject,
        event: 'candidate',
        data: e.candidate
      }))
      this.isSetICE = true
    }
    this.peer.ontrack = e => {
      if (e && e.streams) {
        this.remoteVideoDom.srcObject = e.streams[0];
      }
    };
  },
  handleAddCandidateError: function () {
    console.log('Oh noes! addICECandidate failed!');
  },
  startSignaling: function (config) {
    if (!config.subject) {
      return false;
    }
    this.subject = config.subject
    this.localVideoDom = config.localVideoDom
    this.remoteVideoDom = config.remoteVideoDom
    var bool = true;
    var transport = conf.openssl === false ? 'ws://' : 'wss://'
    this.signaling = new WebSocket(transport + conf.serviceAddress + ':8877')
    this.signaling.onopen = onopensocket
    this.signaling.onmessage = onmessage
    this.signaling.onerror = socketError
    this.signaling.onclose = socketClose
    function onopensocket () {
      webrtc.signaling.send(JSON.stringify({
        cmd: 'subscribe',
        subject: config.subject
      }))
    }
    function onmessage (mes) {
      var res = webrtc.evil(mes.data)
      switch (res.event) {
        case 'offer':
          console.log(res.data)
          webrtc.answer(res.data)
          break;
        case 'answer':
          webrtc.peer.setRemoteDescription(res.data)
          console.log(res.data)
          break;
        case 'candidate':
          webrtc.peer.addIceCandidate(res.data)
          console.log(res.data)
          break;
      }
    }
    function socketError () {
      console.log('socket error')
      webrtc.error = 'socket error'
      bool = false
    }
    function socketClose () {
      console.log('close socket')
      webrtc.error = 'socket closed'
      bool = false
    }
    return bool
  },
  offer: function () {
    console.log(webrtc.peer)
    this.peer.createOffer()
      .then(offer => this.peer.setLocalDescription(offer)).catch((e) => { console.log(e) })
      .then(() => {
        // remoteConnection.setRemoteDescription(localConnection.localDescription)
        this.signaling.send(JSON.stringify({
          cmd: 'publish',
          subject: this.subject,
          event: 'offer',
          data: this.peer.localDescription
        }))
      }).catch(this.handleCreateDescriptionError);
  },
  answer: function (localDescription) {
    console.log(this.peer)
    this.peer.setRemoteDescription(localDescription)
    this.peer.createAnswer()
      .then(answer => this.peer.setLocalDescription(answer))
      .then(() => {
        // localConnection.setRemoteDescription(remoteConnection.localDescription)
        this.signaling.send(JSON.stringify({
          cmd: 'publish',
          subject: this.subject,
          event: 'answer',
          data: this.peer.localDescription
        }))
      }).catch(this.handleCreateDescriptionError);
  },
  handleCreateDescriptionError: (error) => {
    console.log('Unable to create an offer: ' + error.toString());
    webrtc.error = error.toString()
  },
  evil: function (fn) {
    // 一个变量指向Function，防止有些前端编译工具报错
    let Fn = Function
    return new Fn('return ' + fn)()
  },
  startLive: async function () {
    let stream;
    try {
      stream = await (navigator.mediaDevices.getUserMedia({ video: true, audio: true }));
      this.localVideoDom.srcObject = stream;
    } catch (e) {
      this.error = e
      return false;
    }
    stream.getTracks().forEach(track => {
      this.peer.addTrack(track, stream);
    });
  },
  signalClose: function () {
    if (this.signaling) {
      this.signaling.close()
      this.signaling = null
    }
  }
}
export default webrtc
