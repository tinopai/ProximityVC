// Express
let express = require('express');
let app = express();

// HTML
let http = require('http').createServer(app);

// Configuration and Socket.IO
let config = require(__dirname + `/config.json`);
let io = require('socket.io')(http);

let pvc = { 
    std: (m, t="Log", c="cyan") => {
        color = { red: `\x1b[31m`, cyan: `\x1b[36m`, yellow: `\x1b[33m` };
        console.log(`${color[c]}[PVC-${t}]\x1b[0m ${m}`);
    },
    err: (m) => pvc.std(m, "Error", "red"),
    warn: (m) => pvc.std(m, "Warning", "yellow"),
    log: (m) => pvc.std(m),
    ratelimit: {
        users:  {
            chat: new Map()
        },
        slowdown: {
            chat: 2
        }
    }
};

app.get('/', (req, res) => res.sendFile(__dirname + `/public/index.html`));


app.use(`/assets`, express.static(`public/assets`));

io.on('connection', (socket) => {
    pvc.log(`${socket.conn.remoteAddress} connected`);

    socket.on('chat message', (msg) => {
        pvc.log(`Message from ${socket.conn.remoteAddress}: "${msg}"`);
        io.emit('chat message', `Received message from server`);
    });

    socket.on('uservoice', (dat) => {
        if(!dat || !dat.userdata || !dat.userdata.id || !dat.userdata.user) return socket.emit("servererror", "Malformed user data");
        if((new TextEncoder().encode(dat.blob)).length > 65055) return socket.emit("servererror", `Data blob is too long: ${(new TextEncoder().encode(dat.blob)).length} B`);

        let proximitydata = {
            success: true,
            "user": dat.userdata.user,
            "id":   dat.userdata.id,
        };
        socket.broadcast.emit(`servervoice`, { 
            blob: dat.blob,
            userdata: proximitydata
        });
    });

    socket.on('cmessage', (dat) => {
        if(!dat || !dat.userdata || !dat.userdata.id || !dat.userdata.user) return socket.emit("servererror", "Malformed user data");
        if(dat.data.length > 280) return socket.emit(`Message is too long, not sending it.`);

        let proximitydata = {
            success: true,
            "user": dat.userdata.user,
            "id":   dat.userdata.id,
        };
        io.emit('cmessage', {
            data: dat.data,
            userdata: proximitydata
        });
    });
});


// Listen to HTTP Port
http.listen(config.port, () => pvc.log(`Listening to *:${config.port}`));
