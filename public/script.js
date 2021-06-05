const socket = io('/');
const video_grid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
const share_btn = document.querySelector('#share_btn');
// muting yourself is default
myVideo.muted = true;

// peer inicialize
// Dont forget to change port
var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443" // 443, 3000
})

var peerList = [];
var videoStream;
const peers = {};
// method prompts the user for permission to use up to one video 
// input device --- in this case camera
var getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;


navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  .then((stream) => {
    videoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");

      call.on("stream", (userStream) => {
        addVideoStream(video, userStream);
      })
    });

    socket.on("user-connected", (userId) => {
      connectNewUser(userId, stream)
    });
  });

peer.on("call", (call) => {
  getUserMedia(
    {
      video: true,
      audio: true
    },
    function (stream) {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", function (remoteStream) {
        addVideoStream(video, remoteStream);
      })
    }, // catching errors
    function (e) {
      console.log(e);
    }
  )
  peerList.push(call);
})

socket.on('user-disconnected', (userId) => {
  if (peers[userId]) {
    peers[userId].close()
  }
})

peer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);
});

// adding new stream with video
const addVideoStream = (video_element, stream) => {
  video_element.srcObject = stream;
  video_element.addEventListener("loadedmetadata", () => {
    video_element.play();
  })

  video_grid.append(video_element);
  let user_count = document.getElementsByTagName("video").length;
  if (user_count > 1) {
    for (let i = 0; i < user_count; i++) {
      document.getElementsByTagName("video")[i].style.width = 100 / user_count + "%";
    }
  }
};



// connecting new user to session
const connectNewUser = (user_id, stream) => {
  const call = peer.call(user_id, stream);
  var video = document.createElement("video");
  call.on("stream", (userStream) => {
    addVideoStream(video, userStream);
  });
  call.on('close', () => {
    video.remove()
  })
  peerList.push(call);
  peers[user_id] = call;
}

// Share screen
share_btn.onclick = () => {
  navigator.mediaDevices.getDisplayMedia({
    video:{
      cursor: 'always'
    },
    audio:{
      echoCancellation: true
    }
  }).then(stream=>{
    let videoShare = stream.getVideoTracks()[0];
    videoShare.onended = () =>{
      stopShare();
    }
    for(let i=0; i<peerList.length;i++){
      let send = peerList[i].peerConnection.getSenders().find((x)=>{
        return x.track.kind == videoShare.kind;
      })
      send.replaceTrack(videoShare);
    }
  })
}

function stopShare(){
  let videoShare = videoStream.getVideoTracks()[0];
  for(let i=0;i<peerList.length;i++){
    let send = peerList[i].peerConnection.getSenders().find((x)=>{
      return x.track.kind == videoShare.kind;
    })
    send.replaceTrack(videoShare);
  }
}


// Video buttons control

const invite_btn = document.querySelector('#invite_btn');
const camera_btn = document.querySelector('#camera_btn');
const mic_button = document.querySelector('#mic_button');

invite_btn.onclick = () => {
  prompt(
    "Copy this room id and send it to people you want to meet", ROOM_ID
  );
}

camera_btn.onclick = () => {
  const isON = videoStream.getVideoTracks()[0].enabled;
  if (isON) {
    videoStream.getVideoTracks()[0].enabled = false;
    html = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="black" class="bi bi-camera-video-off-fill" viewBox="0 0 16 16">
    <path fill-rule="evenodd" d="M10.961 12.365a1.99 1.99 0 0 0 .522-1.103l3.11 1.382A1 1 0 0 0 16 11.731V4.269a1 1 0 0 0-1.406-.913l-3.111 1.382A2 2 0 0 0 9.5 3H4.272l6.69 9.365zm-10.114-9A2.001 2.001 0 0 0 0 5v6a2 2 0 0 0 2 2h5.728L.847 3.366zm9.746 11.925-10-14 .814-.58 10 14-.814.58z"/>
    </svg>`
    camera_btn.innerHTML = html;
  } else {
    videoStream.getVideoTracks()[0].enabled = true;
    html = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="black" class="bi bi-camera-video-fill" viewBox="0 0 16 16">
    <path fill-rule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z"/>
    </svg>`
    camera_btn.innerHTML = html;
  }
}

mic_button.onclick = () => {
  const isON = videoStream.getAudioTracks()[0].enabled;
  if (isON) {
    videoStream.getAudioTracks()[0].enabled = false;
    html = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="black" class="bi bi-mic-mute-fill" viewBox="0 0 16 16">
    <path d="M13 8c0 .564-.094 1.107-.266 1.613l-.814-.814A4.02 4.02 0 0 0 12 8V7a.5.5 0 0 1 1 0v1zm-5 4c.818 0 1.578-.245 2.212-.667l.718.719a4.973 4.973 0 0 1-2.43.923V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 1 0v1a4 4 0 0 0 4 4zm3-9v4.879L5.158 2.037A3.001 3.001 0 0 1 11 3z"/>
    <path d="M9.486 10.607 5 6.12V8a3 3 0 0 0 4.486 2.607zm-7.84-9.253 12 12 .708-.708-12-12-.708.708z"/>
    </svg>`
    mic_button.innerHTML = html;

  } else {
    videoStream.getAudioTracks()[0].enabled = true;
    html = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="black" class="bi bi-mic-fill" viewBox="0 0 16 16">
    <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z"/>
    <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
    </svg>`
    mic_button.innerHTML = html;
  }
}

