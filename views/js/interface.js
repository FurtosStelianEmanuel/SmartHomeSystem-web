var Socket;
lastPongSocket = 0;
lastArduinoMessage = 0;
arduinoPingPeriod = 60000;
MAX_RECORDED_EVENTS = 20;
eventCounter = 0;
UTC_OFFSET = 3;
chatIDs = [];

zileleSaptamanii = ["Luni", "Marti", "Miercuri", "Joi", "Vineri", "Sambata", "Duminica"];
/*
 * @ utcString Miercuri, 14:15:3 UTC
 */
function getRomaniaTime(utcString) {
    ar = utcString.split(" ");
    ziua = ar[0].replace(",", "");
    ora = parseInt(ar[1].split(":")[0]);
    minute_ = parseInt(ar[1].split(":")[1]);
    secunde = parseInt(ar[1].split(":")[2]);
    ora += UTC_OFFSET;
    if (ora >= 24) {
        ora = ora % 24;
        index = (zileleSaptamanii.indexOf(ziua) + 1) % 7;
        ziua = zileleSaptamanii[index];
    }
    if (parseInt(ora) < 10) {
        ora = "0" + ora;
    }
    if (parseInt(minute_) < 10) {
        minute_ = "0" + minute_;
    }
    if (parseInt(secunde) < 10) {
        secunde = "0" + secunde;
    }
    return ziua + ", " + ora + ":" + minute_ + ":" + secunde;
}

function setSocketLabel(state) {
    document.getElementById("server_socket_status").innerHTML = "Socket : " + state;
}

function setArduinoLabel(state) {
    document.getElementById("arduino_status").innerHTML = "Arduino : " + state;
}

function getUserChatFromName(name) {
    return name.replace(/[ ]/g, '_').toLowerCase() + "Chat";
}

function applySocketEvents() {
    Socket.on('connect', () => {
        console.log(obj)
        console.log('daca mai sus apare null sau undefined')
        setSocketLabel('online')
        Socket.emit('authenticate', { 'username': obj.username })
    })
    Socket.on('message', (msg) => {
        var obj = JSON.parse(msg);
        lastPongSocket = new Date().getTime();
        if (obj.sursa == "Arduino") {
            setArduinoLabel("online");
            lastArduinoMessage = new Date().getTime();
            if (obj.continut[0].ping_period != undefined) {
                try {
                    arduinoPingPeriod = parseInt(obj.continut[0].ping_period);
                } catch (error) {
                    console.log("eroare prinsa ");
                    console.log(error);
                }
            }
        }
        if (obj.tip == "Evenimente") {
            obj.continut.forEach(eveniment => {
                //document.getElementById("rxConsole").value += eveniment.utc + " " + eveniment.descriere + "\n";

                if (eventCounter >= MAX_RECORDED_EVENTS) {
                    document.getElementById("eventlog_body").innerHTML = '';
                    eventCounter = 0;
                }
                eventCounter++;
                table = document.getElementById("eventlog_body");
                var tr = document.createElement("tr");
                var utc = document.createElement("td");
                utc.innerHTML = getRomaniaTime(eveniment.utc);
                var descriere = document.createElement("td");
                descriere.innerHTML = eveniment.descriere;
                tr.appendChild(utc);
                tr.appendChild(descriere);
                table.appendChild(tr);
            });
        }
        if (obj.tip == "mesaj") {
            //<span class="time-right">11:00</span>
            console.log("Am primit mesaj de la " + obj.emitator + ": " + obj.continut);
            var container = document.createElement("div");
            container.className = "container";
            var img = document.createElement("img");
            img.alt = "Avatar " + obj.emitator;
            img.style = "width:100%";
            img.src = "/image-bank/avatar?usr=" + obj.emitator;
            var continut = document.createElement("p");
            var ora = document.createElement("span");
            ora.className = "time-right";
            var timp = new Date();
            ora.innerHTML = timp.getHours() + ":" + timp.getMinutes() + ":" + timp.getSeconds();
            continut.innerHTML = obj.continut;
            continut.style.textAlign = "left";
            container.appendChild(img);
            container.appendChild(continut);
            container.appendChild(ora);
            var finalHolder = document.getElementById(getUserChatFromName(obj.emitator));
            finalHolder.appendChild(container);
            document.getElementById(getUserChatFromName(obj.emitator)).scrollTop =
                document.getElementById(getUserChatFromName(obj.emitator)).scrollHeight;
        }
        if (obj.tip == "Nu ti am gasit IP-ul printre userii activi, WebSocket inchis") {
            setSocketLabel("Nu esti logat");
            clearInterval(connectionChecker);
            try {
                Socket.conn.close();
            } catch (error) {

            }
        } else {
            setSocketLabel("online");
        }
        //console.log("masaj " + obj.tip);
    })
    window.onbeforeunload = function () {
        Socket.emit('message', JSON.stringify({
            "tip": "disconnect"
        }));
    }
    Socket.onopen = function (event) {
        Socket.emit('message', JSON.stringify({
            "tip": "ping"
        }));
    }
}

function getCurrentChatID() {
    s = document.getElementById("destinatar").innerHTML.replace(/[ ]/g, '_').toLowerCase() + "Chat";
    return s;
}

function replaceAll(string, search, replace) {
    return string.split(search).join(replace);
}
window.onload = function (event) {
    const Http = new XMLHttpRequest();
    const avatarsRequest = new XMLHttpRequest();
    const url = '/active-user';

    var width = screen.width;
    document.getElementById("text_box").style.width = width - 50 + "px";

    Http.open("GET", url);
    Http.send();
    Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 200) {
            obj = JSON.parse(Http.responseText);

            Socket = io();
            applySocketEvents();

            document.getElementById("username_paragraph").innerHTML = obj.username;
            var menu = document.getElementById("mySidenav");
            obj.interface_options.forEach(option => {
                var extraOption = document.createElement("a");
                extraOption.className = "sidenavButton";
                option = replaceAll(option, ' ', '\xa0');
                extraOption.innerHTML = option + '\xa0';
                option = replaceAll(option, '.', '\xa0');

                extraOption.href = "javascript:void(0)";
                functionName = replaceAll(option, '\xa0', '').toLowerCase();
                extraOption.onclick = window[functionName + "Pressed"];
                menu.appendChild(extraOption);
            });

            obj.friends.forEach((friend, index) => {
                var container = document.createElement("div");
                container.className = "container";
                var img = document.createElement("img");
                img.alt = "Avatar " + friend;
                img.style = "width:100%";
                img.src = "/image-bank/avatar?usr=" + friend;
                var nume = document.createElement("p");
                nume.innerHTML = friend; //acilea
                container.appendChild(img);
                container.appendChild(nume);
                container.onclick = (event) => {
                    document.getElementById("destinatar").innerHTML = friend;
                    document.getElementById(getCurrentChatID()).style.display = "block";
                    switchInterface(document.getElementById("message_interface"), 0, "w3-container w3-center w3-animate-right");
                };
                var finalHolder = document.getElementById("chat_content_holder");
                finalHolder.appendChild(container);

                var userChat = document.createElement("div");
                userChat.id = friend.replace(/[ ]/g, '_').toLowerCase() + "Chat";
                chatIDs.push(userChat.id);
                userChat.style = "height:300px; overflow:auto; background-color:#ffffff; display:none;";
                document.getElementById("message_interface").appendChild(userChat);
                //document.getElementById("message_interface").insertBefore(document.getElementById("text_box"),userChat);
            });
        }
    }

    connectionChecker = setInterval(() => {

        elapsedTimeSinceArduinoLastMessage = new Date().getTime() - lastArduinoMessage;
        if (elapsedTimeSinceArduinoLastMessage > arduinoPingPeriod + 10000) {
            setArduinoLabel("offline");
        }


    }, 10000);

}

function eventlogPressed() {
    switchInterface(document.getElementById("eventlog_interface"));
}

function chatPressed() {
    switchInterface(document.getElementById("chat_interface"));
}

function shsPressed() {
    async function delay() {
        closeNav();
        await new Promise(r => setTimeout(r, 600));
        window.location.replace("/");
    }
    delay();
}

function homePressed() {
    switchInterface(document.getElementById("home_interface"));
}

function logoutPressed() {
    Socket.emit('message', JSON.stringify({
        tip: "logout"
    }));
    async function delay() {
        closeNav();
        await new Promise(r => setTimeout(r, 600));
        window.location.replace("");
    }
    delay();
}

function serveradminPressed() {
    console.log('am trimis')
    Socket.emit('server-monitor-update', 'Vreau sa stiu de server', (response) => {
        let data = JSON.parse(response)
        let table = document.getElementById('server_admin_body')
        data.forEach(serverMonitor => {
            let tr = document.createElement("tr");
            let domeniu = document.createElement("td");
            domeniu.innerHTML = /*serverMonitor.origin*/'Fara domeniu'
            let ip = document.createElement("td");
            ip.innerHTML = serverMonitor.ip;
            tr.appendChild(domeniu);
            tr.appendChild(ip);
            table.appendChild(tr);
        })
    })
    switchInterface(document.getElementById('server_admin_interface'))
}

window.onclick = function (event) {
    if (event.target != document.getElementById("mySidenav") && event.target != document.getElementById("spanac") &&
        event.target.className != "sidenavButton") {
        closeNav();
    }
}

function sendMessage() {
    Socket.emit('message', JSON.stringify({
        "tip": "mesaj",
        "continut": document.getElementById("text_box").value,
        "destinatar": document.getElementById("destinatar").innerHTML,
        "emitator": document.getElementById("username_paragraph").innerHTML
    }));
    if (Socket.readyState != 2 && Socket.readyState != 3) {
        var container = document.createElement("div");
        container.className = "container darker";
        var img = document.createElement("img");
        img.alt = "Avatar " + obj.emitator;
        img.style = "width:100%";
        img.src = "/image-bank/avatar?usr=" + document.getElementById("username_paragraph").innerHTML;
        img.className = "right";
        var continut = document.createElement("p");
        var ora = document.createElement("span");
        ora.className = "time-left";
        var time = new Date();
        ora.innerHTML = time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
        continut.innerHTML = document.getElementById("text_box").value;
        continut.style.textAlign = "right";
        container.appendChild(img);
        container.appendChild(continut);
        container.appendChild(ora);
        var finalHolder = document.getElementById(getCurrentChatID());
        finalHolder.appendChild(container);
        document.getElementById(getCurrentChatID()).scrollTop = document.getElementById(getCurrentChatID()).scrollHeight;
    } else {
        var container = document.createElement("div");
        container.className = "container darker";
        var img = document.createElement("img");
        img.alt = "Avatar " + obj.emitator;
        img.style = "width:100%";
        img.src = "&#9888;";
        img.alt = "&#9888;";
        img.className = "right";
        var continut = document.createElement("p");
        var ora = document.createElement("span");
        ora.className = "time-left";
        var time = new Date();
        ora.innerHTML = time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
        continut.innerHTML = "Conexiunea pierduta cu serverul";
        continut.style.textAlign = "right";
        container.appendChild(img);
        container.appendChild(continut);
        container.appendChild(ora);
        var finalHolder = document.getElementById(getCurrentChatID());
        finalHolder.appendChild(container);
        document.getElementById(getCurrentChatID()).scrollTop = document.getElementById(getCurrentChatID()).scrollHeight;
    }
    document.getElementById("text_box").value = "";
}

function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

function chatBackButtonPressed() {
    switchInterface(document.getElementById("chat_interface"), 0, "w3-container w3-center w3-animate-left");
}




function switchInterface(element, delayAmount, animationStyle) {
    if (delayAmount == undefined) {
        delayAmount = 500;
    }
    if (animationStyle == undefined) {
        animationStyle = "w3-container w3-center w3-animate-top";
    }
    async function delay() {
        closeNav();
        await new Promise(r => setTimeout(r, delayAmount));
        document.getElementById("home_interface").style.display = "none";
        document.getElementById("eventlog_interface").style.display = "none";
        document.getElementById("chat_interface").style.display = "none";
        document.getElementById("message_interface").style.display = "none";
        document.getElementById('server_admin_interface').style.display = 'none';
        element.className = animationStyle;
        element.style.display = "block";

        if (getCurrentChatID().includes("Chat") && getCurrentChatID() != "mesagerieChat") {
            chatIDs.forEach(chatID => {
                document.getElementById(chatID).style.display = "none";
            });
            document.getElementById(getCurrentChatID()).style.display = "block";
        }

    }
    delay();
}


request = new XMLHttpRequest()

request.open('GET', 'http://api.mysmarthomesystem.com')
request.onreadystatechange = () => {
    if (request.readyState == 4 && request.status == 200) {
        console.log(request.responseText)
    }
}

request.send()