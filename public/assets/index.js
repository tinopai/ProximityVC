/* Socket.IO */
let socket = io();

function startSendingData(tmp_userdata) {
    if(!tmp_userdata) return "Invalid UserData";


    let usersInVoiceChat = {}, userlist = document.getElementById("userlist");

        navigator.mediaDevices.getUserMedia({ audio: true }).then(ms => {
            let mr = new MediaRecorder(ms);
            mr.onstart = () => this.vchunks = [];
            mr.ondataavailable = e => this.vchunks.push(e.data);

            mr.onstop = e => {
                let datablob = new Blob(this.vchunks, { 'type' : 'audio/ogg; codecs=opus' });
                let proximitydata = {
                    user: tmp_userdata.user,
                    id:   tmp_userdata.id
                };
                socket.emit('uservoice', { 
                    blob: datablob,
                    userdata: proximitydata
                });
                usersInVoiceChat[tmp_userdata.user] = tmp_userdata.id;
            };

            mr.start();
            let ivl = setInterval(() => {
                mr.stop()
                mr.start()
                /* Catch doesnt seem to work, we'll see later  */
                // .catch(() => {
                //     document.write(`Sorry! Couldn't start the MediaRecorder, maybe you blocked microphone access?`);
                //     clearInterval(ivl);
                // });

                let ulbuilder = "";
                for(let [key, value] of Object.entries(usersInVoiceChat)) {
                    ulbuilder += `<li>${key}</li>`;
                }
                userlist.innerHTML = ulbuilder;
                usersInVoiceChat = {};
            }, 500);
        });

        socket.on('servervoice', dat => {
            blobdata = dat.blob;
            let blob = new Blob([blobdata], { 'type' : 'audio/ogg; codecs=opus' });
            let audio = document.createElement('audio');
            audio.src = window.URL.createObjectURL(blob);
            audio.play();
        
            usersInVoiceChat[dat.userdata.user] = dat.userdata.id;
        });   
}
 

/* Parsing Chat */
socket.on('chat message', function(msg){
    console.log(msg);
});
