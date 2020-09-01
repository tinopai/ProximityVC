/* Socket.IO */
let socket = io();
/* Temp values */
let tmp = {}, usersInVoiceChat = {}, joinedVC = false;

let pvc = {
    errors: { 
        ids: { 
            1: "Malformed user data", 
            2: "Already joined voice chat" 
        },
        builder: (tmpid) => {
            return {success:false, id: tmpid, message: pvc.errors.ids[tmpid]};
        }
    }
}

function startSendingData(tmp_userdata) {
    if(!tmp_userdata) return pvc.builders.error(1);
    if(joinedVC) return pvc.errors.builder(2);

    document.getElementById('nicknameinput').disabled = true;
    document.getElementById('joinvcbutton').disabled = true;

    joinedVC = true;
    let userlist = document.getElementById("userlist");

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
                usersInVoiceChat[tmp_userdata.id] = tmp_userdata.user;
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
                    ulbuilder += `<li>${value}.${key}</li>`;
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
        
            usersInVoiceChat[dat.userdata.id] = dat.userdata.user;
        });   
}

function randomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

let capitalize = (str) => {
    let strb = [];
    str = str.split(" ");
    for(let i=0;i<str.length;i++)
        strb.push(`${str[i].charAt(0).toUpperCase()}${str[i].slice(1).toLowerCase()}`);

    return strb.join(" ");
}

let joinvc = () => {
    if(joinedVC) return pvc.errors.builder(2);

    /* Get random ID */
    tmp['id']=randomNum(0, 9999);
    while(Object.keys(usersInVoiceChat).includes(tmp.id))
        tmp.id=randomNum(0, 9999);

    /* Retrieve username */
    let nicknameinput = document.getElementById('nicknameinput');


    let nouns = [ "army","emphasis","guitar","queen","actor","attitude","artisan","language","player","vehicle","idea","country","nation","imagination","weakness","contribution","health","two","elevator","percentage","pollution","drawing","assumption","industry","reality","dealer","desk","patience","road","recommendation","addition","effort","poem","perspective","wood","girlfriend","profession","virus","difficulty","alcohol","unit","development","committee","thought","depth","apartment","consequence","event","poetry","equipment","contribution","situation","alcohol","president","ambition","family","road","piano","society","speaker","uncle","nation","procedure","outcome","heart","poet","community","history","department","database","tea","intention","opportunity","song","celebration","wedding","charity","army","son","ability","love","moment","historian","payment","food","basket","relation","negotiation","hotel","grandmother","pizza","inflation","elevator","possession","manufacturer","housing","introduction","length" ];
    let adjectives = [ "blushing","uttermost","dysfunctional","responsible","rotten","tan","ripe","idiotic","dusty","superficial","mundane","rural","past","gigantic","colorful","brave","gorgeous","foreign","zonked","mammoth","possible","resolute","silly","chemical","icy","laughable","jobless","violent","cagey","disgusted","pathetic","furtive","asleep","steadfast","decent","scattered","bewildered","hurried","innate","simple","offbeat","scintillating","whole","worthless","rude","basic","understood","jittery","obnoxious","delicious","mountainous","unruly","enormous","brown","therapeutic","big","omniscient","abundant","excellent","murky","abiding","taboo","gaping","lyrical","hollow","secretive","wrong","momentous","amuck","pleasant","red","grotesque","sulky","mean","careless","thirsty","informal","grubby","lazy","foreign","heavenly","clammy","heavy","majestic","blue-eyed","adhesive","abrupt","profuse","relevant","imported","aspiring","high","shy","adaptable","ablaze","first","elfin","possessive","learned","nutritious" ];
    if(!nicknameinput.value || nicknameinput.value == null) 
        nicknameinput.value = `${capitalize(adjectives[Math.floor(Math.random() * adjectives.length)])} ${capitalize(nouns[Math.floor(Math.random() * nouns.length)])} ${Math.round(Math.random()) == 1 ? "Boy" : "Girl"}`;

    startSendingData({user: nicknameinput.value, id: tmp.id});
    return {success:true, user: nicknameinput.value, id: tmp.id };
}

/* Parsing Chat */
socket.on('chat message', function(msg){
    console.log(msg);
});
