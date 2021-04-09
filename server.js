
const http = require('http');

const express = require('express');
const path = require('path');
const app = express();

const bodyParser = require('body-parser')
const os = require('os');
const ifaces = os.networkInterfaces();
const url = require('url');
const fs = require('fs');
const dns = require('godaddy-dns');

const MAX_PENDING_MESSAGES_STORED = 30;



class SmartHomeSystemUser {
    constructor(username, password, ip, background, socket, ping_period, interface_options, friends, avatar) {
        this.username = username;
        this.password = password;
        this.ip = ip;
        this.background = background;
        this.socket = socket;
        this.ping_period = ping_period;
        this.interface_options = interface_options;
        this.friends = friends;
        this.avatar = avatar;
        if (this.ping_period == undefined) {
            this.ping_period = "60000";
        }
        if (this.interface_options == undefined) {
            this.interface_options = [];
        }
        if (this.friends == undefined) {
            this.friends = [];
        }
    }
    getJson = () => {
        //return '{\"username\":' + '\"' + this.username + '\",\"ping_period\":\"' + this.ping_period + '\"}';
        return {
            username: this.username,
            ping_period: this.ping_period,
            interface_options: this.interface_options,
            friends: this.friends
        };
    }
}

const getUsers = () => {
    let rawdata = fs.readFileSync('users.json');
    let usersjson = JSON.parse(rawdata);
    users = [];
    usersjson.users.forEach(user => {
        smartUser = new SmartHomeSystemUser(user.username,
            user.password,
            "",
            user.background,
            undefined,
            undefined,
            user.interface_options,
            user.friends,
            user.avatar);
        users.push(smartUser);
    });

    return users;
}

const getExternalIP = (callback) => {
    http.get({
        host: 'ipv4bot.whatismyipaddress.com',
        port: 80,
        path: '/'
    }, function (res) {
        //console.log("status: " + res.statusCode);
        results = [];
        res.on("data", (chunk) => {
            results.push(chunk);
        });
        res.on("end", () => {
            callback(results[0].toString());
        });
    }).on('error', (e) => {
        console.log(e);
    });
}

const updateDNS_onError = () => {
    dns.getCurrentIp().then((currentIP) => {
        updateDNS(currentIP);
    });
}

const updateDNS = (ip) => {
    console.log("IP-ul server-ului s-a schimat,se updateaza recordurile DNS");
    dns.updateRecords(ip, {
        "apiKey": "e5CYVRE3Bh4T_KtyBJXdsSagB3bb5yRuHiY",
        "secret": "FRJf2AiGXK3xq5qQcDA1Ng",
        "domain": "mysmarthomesystem.com",
        "records": [
            { "type": "A", "name": "@", "ttl": 600 }
        ]
    })
        .then(() => {
            console.log(`[${new Date()}] Am schimbat recordurile DNS cu ip-ul ${ip}`)
            fs.writeFile("lastIP.json", "{\"ip\":\"" + ip + "\"}", 'utf8', function (err) {
                if (err) {
                    console.log("Eroare cand am incercat sa scriu json");
                    console.log(err);
                    return err;
                }
                console.log("Ultimul IP a fost salvat " + "{\"ip\":\"" + ip + "\"}");
            });
        })
        .catch((err) => {
            if (err && err.message !== 'Nimic de updatat') {
                console.error(`[${new Date()}] ${err}`)
                process.exit(1)
            }
        });
}

const ipRoutine = () => {
    let rawdata = fs.readFileSync('lastIP.json');
    try {
        let lastip = JSON.parse(rawdata);
        getExternalIP((externalIP) => {
            if (lastip.ip != externalIP) {
                updateDNS(externalIP);
            }
        });
    } catch (error) {
        updateDNS_onError()
    }
}


function getInternalIP(callback) {
    Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;

        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                return;
            }

            if (alias >= 1) {
                callback(iface.address);
            } else {
                callback(iface.address);
            }
            ++alias;
        });
    });
}

function printServerExternalIP() {
    http.get(options, function (res) {
        console.log("status: " + res.statusCode);

        res.on("data", function (chunk) {
            console.log("BODY: " + chunk);
        });
    }).on('error', function (e) {
        console.log("error: " + e.message);
    });
}

function printLocalNetworkInterface() {
    Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;

        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }

            if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
                console.log(ifname + ':' + alias, iface.address);
            } else {
                // this interface has only one ipv4 adress
                console.log(ifname, iface.address);
            }
            ++alias;
        });
    });
}

app.use(express.static(__dirname + '/views/'));
app.use(bodyParser.json());

const verifyAPIHost = (req, res) => {
    if (req.hostname == 'api.mysmarthomesystem.com') {
        return true
    } else {
        res.status(403).send('<!DOCTYPE html><html><h1>Pentru a accesa API-ul trebuie folosit hostul <a href="http://api.mysmarthomesystem.com">api.mysmarthomesystem.com</a></h1></html>')
    }
}

/**
 *  primeste ca parametri query:
 *      uptime (upt)
 *      requests (reqs)
 *  (.*) = parametrul ce va aparea in query                                      
 */
app.get('/api', (req, res) => {
    if (verifyAPIHost(req, res)) {
        raspuns = {}
        if (req.query.upt != undefined) {
            raspuns.upt = '*Insert uptime here*'
        }
        if (req.query.reqs != undefined) {
            raspuns.reqs = '*Insert number of requests here*'
        }
        res.send(raspuns)
    }
})

/**
 * @deprecated
 * @param {*} req 
 * @param {*} res 
 */
const handleAPIRequest = (req, res) => {
    console.log(req.url)
    console.log(req.headers)
    console.log('----')
    console.log(req.body)
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost')
    res.status(200).send('bv')
}

app.use((req, res, next) => {
    if (req.hostname.split('.')[0] == 'api' && req.url == '/') {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost')
        res.send('Pagina de prezentare pentru API')
        //handleAPIRequest(req, res)
    } else {
        next()
    }
})

global.pendingMessages = [];



const isSmartHomeSystemUser = (parsed_url, validUsers) => {
    user = new SmartHomeSystemUser(parsed_url.query.uname, parsed_url.query.psw);
    found = false;
    validUsers.some(validUser => {
        if (validUser.username == user.username) {
            found = true;
            return;
        }
    });
    return found;
}

const isSmartHomeSystemPassword = (parsed_url, validUsers) => {
    user = new SmartHomeSystemUser(parsed_url.query.uname, parsed_url.query.psw);
    found = false;
    validUsers.forEach(validUser => {
        if (user.username == validUser.username && user.password == validUser.password) {
            found = true;
            return;
        }
    });
    return found;
}

const getSmartHomeSystemUserBackground = (user, validUsers) => {
    background = undefined;
    validUsers.forEach(validUser => {
        if (user == validUser.username) {
            background = validUser.background;
            return;
        }
    });
    return background == undefined ? "default.jpg" : background;
}

global.activeUsers = [];

const getSmartHomeSystemUser = (username, validUsers) => {
    user = undefined;
    validUsers.forEach(validUser => {
        if (validUser.username == username) {
            user = validUser;
            return;
        }
    });
    return user;
}
app.get('/disconnect', (req, res) => {
    global.activeUsers = [];
    res.send("indeplinitus");
});
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/about.html'));
});

app.get('/cod/esp8266', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/cod/esp8266.txt'));
});

app.get('/smarthomesystem/android', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/smarthomesystem/android/android.html'));
});
app.get('/smarthomesystem/web', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/smarthomesystem/web/web.html'));
});
app.get('/', (req, res) => {
    console.log("cineva a cerut main " + (req.headers['x-forwarded-for'] || req.connection.remoteAddress));
    console.log(req.body);
    parsed = url.parse(req.url, true);
    if (parsed.query.uname != undefined && parsed.query.psw != undefined) {
        users = getUsers();
        if (isSmartHomeSystemUser(parsed, users)) {
            if (isSmartHomeSystemPassword(parsed, users)) {
                for (let i = global.activeUsers.length - 1; i >= 0; i--) {
                    if (global.activeUsers[i].username == parsed.query.uname || global.activeUsers[i].ip == (req.headers['x-forwarded-for'] || req.connection.remoteAddress)) {
                        global.activeUsers.splice(i, 1);
                    }
                }
                user = getSmartHomeSystemUser(parsed.query.uname, users);
                if (user != undefined) {
                    global.activeUsers.push(new SmartHomeSystemUser(user.username,
                        user.password,
                        req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                        getSmartHomeSystemUserBackground(parsed.query.uname, users),
                        user.socket,
                        user.ping_period,
                        user.interface_options,
                        user.friends,
                        user.avatar
                    ));
                    res.redirect("/interfata");
                } else {
                    res.send("Eroare interna ");
                }
            } else {
                res.send("parola gresita");
            }
        } else {
            res.send("nu esti inregistrat");
        }
    } else {
        res.sendFile(path.join(__dirname + '/views/home.html'));
    }
});


app.get('/interfata', (req, res) => {
    foundIP = false;
    global.activeUsers.forEach(user => {
        if (user.ip == (req.headers['x-forwarded-for'] || req.connection.remoteAddress)) {
            foundIP = true;
            return;
        }
    });
    if (foundIP) {
        res.sendFile(path.join(__dirname + '/views/interfata.html'));
    } else {
        res.send("Nu esti logat");
    }
});
app.get('/image-bank/*', (req, res) => {
    parsed = url.parse(req.url, true);
    found = false;
    registeredUsers = getUsers();
    global.activeUsers.forEach(user => {
        if ((req.headers['x-forwarded-for'] || req.connection.remoteAddress) == user.ip) {
            found = true;
            founduser = false;
            for (let i = 0; i < registeredUsers.length; i++) {
                if (registeredUsers[i].username == parsed.query.usr) {
                    founduser = true;
                    res.sendFile(path.join(__dirname + '/views/imagini/avatare/' + registeredUsers[i].avatar));
                    break;
                }
            }
            if (!founduser) {
                res.send("Nu am gasit user cu avatar pt " + parsed.query.usr);
            }
            return;
        }
    });
    if (!found) {
        res.send("Nu esti logat, poarta proasta");
    }
});
app.get('/image-bank', (req, res) => {
    found = false;
    parsed = url.parse(req.url, true);
    global.activeUsers.forEach(user => {
        if ((req.headers['x-forwarded-for'] || req.connection.remoteAddress) == user.ip) {
            found = true;
            res.sendFile(path.join(__dirname + '/views/imagini/' + user.background));
            return;
        }
    });
    if (!found) {
        res.send("Nu esti logat, poarta proasta");
    }
});

app.get('/smarthomesystem/icon', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/imagini/smarthomesystemicon.png'));
});

app.get('/smarthomesystem/desktop', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/smarthomesystem/desktop/desktop.html'));
});

app.get('/active-user', (req, res) => {

    found = false;
    global.activeUsers.forEach(user => {
        if ((req.headers['x-forwarded-for'] || req.connection.remoteAddress) == user.ip) {
            found = true;
            res.send(user.getJson());
            return;
        }
    });
    if (!found) {
        res.send("Nu esti logat, poarta proasta");
    }
});

app.get('/smarthomesystem', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/smarthomesystem/smarthomesystem.html'));
});

/**
 * ba poate schimba si formatu din arduino in loc de user sa fie username ca te cam incurci daca e
 */
app.post('/report-event', (req, res) => {
    userActiv = false;
    console.log(req.headers)
    console.log(req.body)
    console.log('vrea sa trimit la ' + req.body.user)
    global.activeUsers.forEach(activeUser => {
        if (activeUser.username == req.body.user) {
            req.body.sursa = "Arduino";
            activeUser.socket.emit('message', JSON.stringify(req.body));
            userActiv = true;
            console.log('am trimis la cine a cerut')
        }
    });
    if (!userActiv) {
        if (req.body.tip != "Ping") {
            if (global.pendingMessages.length > MAX_PENDING_MESSAGES_STORED) {
                global.pendingMessages = [];
                console.log("Am golit pending messages");
            }
            global.pendingMessages.push({ username: req.body.user, continut: req.body.continut, tip: req.body.tip });
        }

    }
    res.set('Connection', 'close');
    res.send("ok");
});

/**
 * retine pingurile de la fiecare server inrolat in mysmarthomesystem
 */
serverMonitors = []

app.get('/up', (req, res) => {
    res.send({ state: 'OK' }).end()
})

app.post('/server-monitor', (req, res) => {
    console.log('Am primit stire de la un server ' + req.connection.remoteAddress)
    console.log(req.headers)
    bad = ''
    if (req.headers.user == undefined) {
        bad += 'User nedefinit in post request'
    }
    if (req.headers.passwd != undefined) {
        bad + '\n Parola nedefinita in post request'
    }
    users = getUsers()
    validUser = users.filter(user => user.username == req.headers.user && user.password == req.headers.passwd)
    if (validUser.length > 1) {
        bad += '\n Conflict de useri'
    } else if (validUser.length < 1) {
        bad += '\nEroare logare ' + req.headers.user + ' ' + req.headers.passwd
    }

    if (bad == '') {
        validUser = validUser[0]
        if (serverMonitors.length > 20) {
            serverMonitors = []
        }
        serverMonitors.push({ origin: validUser.username, ip: req.body.ip })
        console.log(serverMonitors[serverMonitors.length - 1])
        res.send(JSON.stringify({ status: 'ok' }))
    } else {
        res.send(JSON.stringify({ status: 'fail', message: bad }))
    }
})


const PORT = process.env.PORT || 8001

server = app.listen(PORT, () => {
    console.log("Server activ :")
});
io = require('socket.io').listen(server);
//ipRoutine();
//getExternalIP((ip) => { console.log("IP extern " + ip); });
//getInternalIP((ip) => { console.log("IP local " + ip) });

io.on('connection', (socket) => {
    console.log('conexiune socket ')
    /* socket.on('masaj',(msg)=>{
         console.log('pisatule')
         console.log(msg)
     })*/
    socket.on('authenticate', (token) => {
        console.log('venira')
        users = getUsers()
        users.forEach(user => {
            if (user.username == token.username) {
                found = false

                for (i in global.activeUsers) {
                    if (global.activeUsers[i].username == token.username) {
                        found = true
                        global.activeUsers[i].socket = socket
                        console.log('am atribuit socket')
                    }
                }
                if (!found) {
                    console.log('nu am atribuit la nimeni socket ' + user.username)
                }
            }
        })
    })
    found = false;
    activeUsers.forEach(activeUser => {
        if (activeUser.socket == socket) {
            found = true;
            console.log('l am gasit')
        }
    });

    if (!found) {
        /*socket.emit(JSON.stringify({ 'tip': 'Nu ti am gasit IP-ul printre userii activi, WebSocket inchis' }));
        console.log("Am refuzat un websocket client " + socket.handshake.address);
        socket.conn.close();*/
    } else {
        console.log(socket.handshake.address);
        activeUsers.forEach(activeUser => {
            if (activeUser.ip == socket.handshake.address) {
                activeUser.socket = socket;
                sendOrdered = [];
                for (let i = global.pendingMessages.length - 1; i >= 0; i--) {
                    if (global.pendingMessages[i].username == activeUser.username) {
                        sendOrdered.push(global.pendingMessages[i]);
                        global.pendingMessages.splice(i, 1);
                    }
                }
                sendOrdered.reverse();
                sendOrdered.forEach(message => {
                    message.sursa = "Arduino";
                    activeUser.socket.emit('message', JSON.stringify(message));
                });
                sendOrdered = [];
            }
        });
    }

    socket.on('server-monitor-update', (message, callback) => {
        let user = activeUsers.filter(activeUser => (activeUser.socket.handshake.headers['x-forwarded-for'] || socket.handshake.address.address == socket.handshake.headers['x-forwarded-for'] || socket.handshake.address.address))
        let bad = ''
        if (user.length > 1) {
            bad += 'Conflict de useri'
        } else if (user.length < 1) {
            bad += 'Nu am gasit useru'
        }
        if (bad == '') {
            user = user[0]
            let selected = serverMonitors.filter(monitor => monitor.origin == user.username)
            callback(JSON.stringify(selected))
        } else {
            console.log(bad)
            //eroare
        }
    })

    socket.on('message', (message) => {
        console.log('primit cv ')
        console.log(message)
        found = false;
        activeUsers.forEach(activeUser => {
            if (activeUser.socket.handshake.headers['x-forwarded-for'] || socket.handshake.address.address == socket.handshake.headers['x-forwarded-for'] || socket.handshake.address.address) {
                found = true;
                return true;
            }
        });
        try {
            if (found) {
                var obj = JSON.parse(message);
                if (obj.tip == "mesaj") {
                    console.log("Mesaj de la " + obj.emitator + " pentru " + obj.destinatar + ": " + obj.continut);
                    found = false;
                    for (let i = 0; i < global.activeUsers.length; i++) {
                        if (global.activeUsers[i].username == obj.destinatar) {
                            global.activeUsers[i].socket.emit('message', JSON.stringify(obj));
                            console.log("Am trimis mesajul lui " + global.activeUsers[i].username);
                            found = true;
                        }
                    }
                    if (!found) {
                        console.log("Nu l am gasit pe " + obj.destinatar + " printre utilizatorii activi");
                    }
                }
                if (obj.tip == "ping") {
                    socket.emit('message', JSON.stringify({ "tip": "pong" }));
                }
                if (obj.tip == "disconnect") {
                    activeUsers.forEach(activeUser => {
                        if (socket == activeUser.socket) {
                            socket.conn.close();
                            console.log("Am incheiat treaba cu %s", socket.handshake.address);
                            return;
                        }
                    });
                }
                if (obj.tip == "logout") {
                    for (let i = global.activeUsers.length - 1; i >= 0; i--) {
                        if (global.activeUsers[i].socket == socket) {
                            console.log("L am delogat pe %s", global.activeUsers[i].username);
                            global.activeUsers.splice(i, 1);
                        }
                    }
                }
            } else {
                console.log("Mesaj ignorat ");
                console.log(message);
            }
        } catch (error) {
            console.log("Eroare la JSON parse");
            console.log(error);
        }
    });

});