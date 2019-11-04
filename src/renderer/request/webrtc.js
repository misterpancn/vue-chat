import conf from '@/store/config/config'
const webrtc = {
  peer: null,
  error: '',
  isSetICE: false,
  subject: null,
  signaling: null,
  remoteVideoDom: null,
  localVideoDom: null,
  status: 1,
  pingTimer: null,
  sender: null,
  rtcCallback: () => {},
  init: async function (subject) {
    if (this.peer !== null) {
      webrtc.rtcCallback({
        status: 'error',
        message: 'peerConnect is open'
      })
      throw new Error('peerConnect is open')
    }
    if (!subject) {
      this.error = '配置参数错误'
      this.status = 0
      webrtc.rtcCallback({
        status: 'error',
        message: '配置参数错误'
      })
      throw new Error('配置参数错误')
    }
    let localVideo = document.querySelector('#local-video');
    let remoteVideo = document.querySelector('#remote-video');
    this.subject = subject
    this.localVideoDom = localVideo
    this.remoteVideoDom = remoteVideo
    localVideo.onloadedmetadata = () => {
      localVideo.play();
    }
    remoteVideo.onloadedmetadata = () => {
      remoteVideo.play();
    }
    let PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    if (!PeerConnection) {
      this.error = '设备不支持RTC功能'
      this.status = 0
      webrtc.rtcCallback({
        status: 'error',
        message: '设备不支持RTC功能'
      })
      throw new Error('设备不支持RTC功能')
    }
    if (this.signaling === null || this.signaling.readyState !== WebSocket.OPEN) {
      this.error = 'signaling server not open'
      this.status = 0
      webrtc.rtcCallback({
        status: 'error',
        message: 'signaling server not open'
      })
      throw new Error('signaling server not open')
    }
    let con = {iceServers: [
      {urls: conf.turnServer, username: conf.turnUser, credential: conf.turnPass}
    ]};
    this.peer = new PeerConnection(con);
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
    this.peer.oniceconnectionstatechange = (e) => {
      if (this.peer) {
        console.log(this.peer.iceConnectionState)
      }
    }
    this.signaling.send(JSON.stringify({
      cmd: 'subscribe',
      subject: subject
    }))
    await this.startLive()
    return true;
  },
  handleAddCandidateError: function () {
    console.log('Oh noes! addICECandidate failed!');
  },
  startSignaling: function (callback) {
    var bool = true;
    this.rtcCallback = callback
    var transport = conf.openssl === false ? 'ws://' : 'wss://'
    this.signaling = new WebSocket(transport + conf.serviceAddress + ':8877')
    this.signaling.onopen = () => {
      webrtc.socketPing()
      webrtc.rtcCallback({
        status: 'init'
      })
    }
    this.signaling.onmessage = onmessage
    this.signaling.onerror = socketError
    this.signaling.onclose = socketClose
    function onmessage (mes) {
      var res = webrtc.evil(mes.data)
      switch (res.event) {
        case 'offer':
          webrtc.answer(res.data)
          break;
        case 'answer':
          webrtc.peer.setRemoteDescription(res.data)
          break;
        case 'candidate':
          webrtc.peer.addIceCandidate(res.data)
          break;
      }
    }
    function socketError () {
      console.log('signaling socket error')
      bool = false
      webrtc.status = 0
      webrtc.rtcCallback({
        status: 'error',
        message: 'signaling socket error'
      })
    }
    function socketClose () {
      console.log('close signaling socket')
    }
    return bool
  },
  offer: function () {
    this.peer.createOffer()
      .then(offer => this.peer.setLocalDescription(offer))
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
    webrtc.status = 0
    webrtc.rtcCallback({
      status: 'error',
      message: 'Unable to create an offer: ' + error.toString()
    })
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
      stream.getTracks().forEach(track => {
        webrtc.sender = webrtc.peer.addTrack(track, stream);
      });
    } catch (e) {
      this.error = e
      this.status = 0
      webrtc.rtcCallback({
        status: 'error',
        message: e
      })
      throw new Error(e)
    }
  },
  signalClose: function () {
    if (this.signaling) {
      this.signaling.close()
      this.signaling = null
      clearInterval(webrtc.pingTimer)
      this.pingTimer = null
      this.closePeer()
    }
  },
  closePeer: function () {
    if (this.peer) {
      if (this.sender) {
        this.peer.removeTrack(this.sender)
      }
      this.peer.close()
      this.peer = null
    }
    this.error = ''
    this.isSetICE = false
    this.subject = null
    this.remoteVideoDom = null
    this.localVideoDom = null
    this.status = 1
  },
  socketPing: function () {
    if (webrtc.pingTimer === null) {
      webrtc.pingTimer = setInterval(() => {
        if (webrtc.WsIsClose()) {
          clearInterval(webrtc.pingTimer)
          this.pingTimer = null
        } else {
          webrtc.signaling.send(JSON.stringify({
            cmd: 'ping',
            data: 1
          }))
        }
      }, 1000 * 30)
    }
  },
  WsIsClose: function () {
    if (webrtc.signaling.readyState === webrtc.signaling.CLOSED || webrtc.signaling.readyState === webrtc.signaling.CLOSING) {
      return true;
    } else {
      return false;
    }
  }
}
export default webrtc
