'use strict';
var filter = new Filter();

// welcome messages to be displayed upon connecting
var welcomeMessages = [""];
var welcomeMessagesFrames = 50;

var WALK = "WALK", ACTION = "ACTION", SLASH = "SLASH", STAB = "STAB", MAGIC = "MAGIC", BIG_SWORD = "BIG_SWORD", SPEAR = "SPEAR" , DIE = "DIE", REVIVE = "REVIVE";

var SPRITES = {
    "MALE": {
        url:"https://i.imgur.com/Ohe9jMp.png",
        attack: SLASH
    },
    "FEMALE": {
        url: "https://i.imgur.com/1Ijv1OJ.png",
        attack: SLASH
    },
    "ORC": {
        url: "https://i.imgur.com/vsn0EYQ.png",
        attack: SLASH
    },
    "KNIGHT_M":{
        url: "https://i.imgur.com/fka32MZ.png",
        attack: SLASH
    },
    "KNIGHT_F":{
        url: "https://i.imgur.com/P1OOh5D.png",
        attack: SPEAR
    },
    "PIXIE": {
        url: "https://i.imgur.com/wnRIs5G.png",
        attack: SLASH
    },
    "RED": {
        url: "https://i.imgur.com/M5Z0Ros.png",
        attack: STAB
    },
    "MAGE": {
        url: "https://i.imgur.com/zbqNOWw.png",
        attack: MAGIC
    },
    "PRINCESS": {
        url: "https://i.imgur.com/DcQJEdW.png",
        attack: STAB
    },
    "HANK": {
        url: "https://i.imgur.com/1w6kCt9.png",
        attack: BIG_SWORD
    },
    "SKELETON": {
        url: "https://i.imgur.com/m99kekZ.png",
        attack: BIG_SWORD
    }
}

var SERVERS = {
    "BEACH": {
        url: "https://todo-tutorial-de017.firebaseio.com",
        bg:"https://thumbs.dreamstime.com/t/top-view-sand-shells-starfish-flat-icon-design-beach-background-93492920.jpg"
    },
    "GRASS": {
        url: "https://crud-tutorial.firebaseio.com",
        bg: "https://img00.deviantart.net/c3f4/i/2011/353/a/a/mobile_game_background_by_disnie-d4jmrye.jpg",
    },
    "MEADOW": {
        url: "https://battle-royale-7ca4f.firebaseio.com",
        bg: "https://png.pngtree.com/thumb_back/fw800/back_pic/04/06/04/56580ef06099bb9.jpg",
        bg: "https://media.istockphoto.com/vectors/top-view-of-the-countryside-vector-id922427928?k=6&m=922427928&s=612x612&w=0&h=F10tpSjLTLbmGYVxVSVUciDoJJf24N6_mzH9b5K5c9o="
    }
}

function getUserCount(serverName, cb){
   var CORS = "https://cors-anywhere.herokuapp.com"; axios.get(`${CORS}/${SERVERS[serverName].url}/connected.json`).then(function(response){
       
       cb(serverName, response.data);
    }).catch(function(err){
        console.log(err);
        cb(serverName, null);
        clearInterval(connectedInterval);
    });
}

function setConnectedUsers(serverName, data){
    var count = data ? Object.keys(data).length : 0;
    var conDiv = document.getElementById(`${serverName}-users`);
    conDiv.innerHTML = `Online Players: ${count}`;
}

function getUserCounts(){
    function check(){
        getUserCount("MEADOW", setConnectedUsers);
        getUserCount("BEACH", setConnectedUsers);
        getUserCount("GRASS", setConnectedUsers);
    }
    check();
    connectedInterval = setInterval(check, 5000);
}

window.onload = getUserCounts;


var FRAMES = "FRAMES", UP = "UP", LEFT = "LEFT", DOWN = "DOWN", RIGHT = "RIGHT", STATIC = "STATIC";

var SPRITE_MAP = {
    MAGIC:{
        FRAMES: 7,
        UP: 0,
        LEFT: 1,
        DOWN: 2,
        RIGHT: 3,
        STATIC: 2
    },
    WALK:{
        FRAMES: 9,
        UP: 8,
        LEFT: 9,
        DOWN: 10,
        RIGHT: 11,
        STATIC: 10
    },
    SLASH:{
        FRAMES: 6,
        UP: 12,
        LEFT: 13,
        DOWN: 14,
        RIGHT: 15,
        STATIC: 14
    },
    STAB:{
        FRAMES: 8,
        UP: 4,
        LEFT: 5,
        DOWN: 6,
        RIGHT: 7,
        STATIC: 6
    },
    DIE:{
        FRAMES: 6,
        UP: 20,
        LEFT: 20,
        DOWN: 20,
        RIGHT: 20,
        STATIC: 20
    },
    BIG_SWORD:{
        FRAMES: 6,
        UP: 22,
        LEFT: 25,
        DOWN: 28,
        RIGHT: 31,
        STATIC: 28
    },
    SPEAR:{
        FRAMES: 8,
        UP: 22,
        LEFT: 25,
        DOWN: 28,
        RIGHT: 31,
        STATIC: 28
    }
}

var SPRITE_W = 64;
var SPRITE_H = 64;
var JOIN = "JOIN";
var DELTA = "DELTA";
var UPDATE = "UPDATE";
var MESSAGE = "MESSAGE";
var ATTACK = "ATTACK";
var ADD_KILL = "ADD_KILL";
var RECOVER_HP = "RECOVER_HP";

var BORDER_LEFT = 0, BORDER_RIGHT = 0, BORDER_BOTTOM = 0, BORDER_TOP = 0;

var DEFAULT_DAMAGE = 10;
var canvas;
var ctx;
var myPlayer;
var joystick;
var fpsInterval = 1000 / 8;
var dbRef;
var dataRef;
var conRef;
var COLLECTION_DELTAS = "deltas";
var MAX_DELTAS = 5;
var players = [];
var name = "";
var onlineUsers = [];
var now;
var then = new Date();
var gender = "MALE";
var selectedBG = "BEACH";
var connectedInterval;

function clearDB(){
    dataRef.set(null);
}

function init(evt) {
    if(!validUsername(document.getElementById("name").value)){
        return;
    }
    
    clearInterval(connectedInterval);
    
    selectedBG = evt.target.name;

    firebase.initializeApp({
        databaseURL: SERVERS[selectedBG].url
    });

    setPlayer(evt);
    
    initFirebase();
    initFirebaseReferences();
    initFirebaseListeners();
    clearDB();

    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    setTimeout(function(){
        canvas.style.height = `${window.innerHeight*0.9}px`;
        BORDER_LEFT = -50;
        BORDER_RIGHT = canvas.width + 50;
        BORDER_BOTTOM = canvas.height + 50;
        BORDER_TOP = -50;
    }, 500);
    
    canvas.style.backgroundImage = `url(${SERVERS[selectedBG].bg})`;
    
    joystick = new Joystick({stickBg: "transparent", stickBgColor:"black", stickColor: "red", stickOpacity: "0.5"});
    join();
    setOnlinePlayer();
    
    requestAnimationFrame(gameLoop);
}

function setPlayer(evt) {
    evt.preventDefault();
    
    name = document.getElementById("name").value || usernames[randVal(0, usernames.length - 1)];
    
    gender = document.getElementById("gender").value;
    
    if(gender === "RANDOM"){
        gender = Object.keys(SPRITES)[randVal(0, Object.keys(SPRITES).length)];
    }
    
    document.getElementById("chat-form").style.display = "flex";
    
    document.getElementById("screen-1").style.display = "none";
    
    document.getElementById("screen-2").style.display = "flex";
}

function validUsername(name){
    if(name.indexOf(':') !== -1){
        alert(`Username cannot contain ':'`);
        return false;
    }
    return true;
}

function setOnlinePlayer() {
    // add user to the logged users list
    // access special reference for presence management
    var isOnline = dbRef.ref('.info/connected');
    var playerWithId = `${myPlayer.name}:${myPlayer.id}:${gender}`;
    // create reference with the username
    var connectedPlayer = firebase.database().ref('/connected/' + playerWithId);
    
    // create listener when new user is logged in
    isOnline.on('value', function(snapshot) {
        if (!snapshot.val()) return;
        // remove the user on disconnect event
        connectedPlayer.onDisconnect().remove();
        // set the user in the connected users list in the DB
        connectedPlayer.set(firebase.database.ServerValue.TIMESTAMP);
    });
}

function join(){
    myPlayer = new Player(ctx, SPRITES[gender], null, name, joystick);
    players.push(myPlayer);

    myPlayer.listen();
    
    function attackFunc(){
        if(myPlayer.actionFrames > 0){
            return;
        }
        sendData({
            type: ACTION,
            action: myPlayer.attackType,
            damage: 10,
            uid: myPlayer.id,
            name: myPlayer.name,
            x: myPlayer.x * SPRITE_W + SPRITE_W * 0.5,
            y: myPlayer.y + SPRITE_H * 0.7,
            direction: myPlayer.direction,
        });
    }

    canvas.addEventListener("touchstart", attackFunc);
    canvas.addEventListener("click", attackFunc);
}

function gameLoop() {
    now = Date.now();
    var elapsed = now - then;

    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        players.sort(function(p1, p2){
            return p1.y - p2.y;
        });
        for (var i = 0; i < players.length; i++) {
            players[i].draw();
        }
        
        if(welcomeMessagesFrames){
        console.log()
            ctx.globalAlpha = welcomeMessagesFrames * 100 / 50/ 100;
            welcomeMessagesFrames--;
            ctx.fillStyle = "blue";
            ctx.font = "30px Arial";
            for (var i = 0; i < welcomeMessages.length; i++) {
                ctx.fillText(welcomeMessages[i], canvas.width / 2 - 120, 30 + 30*i);
            }
            ctx.font = "12px Arial";
        }
    }

    requestAnimationFrame(gameLoop);
}

function checkHit(data){
    var attackingPlayer = players.find(function(p){
        return p.id === data.uid;
    });
    
    for (var i = 0; i < players.length; i++) {
        var p = players[i];
        var x = p.x * SPRITE_W + SPRITE_W * 0.5;
        var y = p.y + SPRITE_H * 0.7;
        
        if(Math.abs(x - data.x) < 50 && Math.abs(y - data.y) < 50 && p.id !== data.uid && p.hp > 0){
            p.takeDamage(data);
            if(p.hp <= 0){
                sendData({
                    type: ACTION,
                    action: DIE,
                    uid: p.id,
                    name: p.name,
                    x: p.x,
                    y: p.y,
                    direction: p.direction
                });
                if(attackingPlayer){
                    attackingPlayer.addKill(data);
                }
            }
        }
    }
}

function updatePlayer(data) {
    //console.log(JSON.stringify(data, null, 2))
    //log(JSON.stringify(data, null, 2));

    var playerToUpdate = players.find(function(p) {
        return p.id === data.uid;
    });
    
    if (playerToUpdate) {
        switch(data.type){
            case DELTA:
                playerToUpdate.update(data);
            break;
            case MESSAGE:
                if(filter.isProfane(data.message)){
                    var id = `${data.name}:${data.uid}:${data.gender}`;
                    
                    dbRef.ref('/connected/' + id).set(null);
                    data.message = KICKED;
                }
                data.message = filter.clean(data.message);
                playerToUpdate.messageStart(data);
                log(`${playerToUpdate.name}: ${data.message}`, true);
            break;
            case ACTION:
            
                playerToUpdate.actionStart(data);
                if([SLASH, STAB, MAGIC, SPEAR, BIG_SWORD].includes(data.action)){
                    checkHit(data);
                }
            break;
            case REVIVE:
                playerToUpdate.hp = 100;
                playerToUpdate.currentAction = WALK;
                playerToUpdate.y = 0;
                playerToUpdate.x = randVal(0, canvas.width / SPRITE_W);
            break;
            case ADD_KILL:
                playerToUpdate.addKill(data);
            break;
            default:
            break;
        }    
    }
}

function onError(err) {
    // error handler function (logs the error to console)
    console.log(err);
}

// FIREBASE INITIALIZATION
function initFirebase() {
    // force firebase to use websockets
    firebase.database.INTERNAL.forceWebSockets();
    // create reference to the firebase database
    dbRef = firebase.database();
}

function initFirebaseReferences() {
    // reference to the deltas collection
    dataRef = dbRef.ref(`${COLLECTION_DELTAS}`);
    conRef = dbRef.ref("connected");
}

function initFirebaseListeners() {

    dataRef.on("child_added", getData, onError);
    //dataRef.orderByChild('timestamp').limitToLast(MAX_DELTAS).once('value', getAllData, onError);
    // set listener for new notifications

    // set listener for new connected user
    conRef.on('value', updateOnlineUsers);
    
}

function updateOnlineUsers(snapshot) {
    // reset the current online users list
    onlineUsers = [];
    // get the new updated connected users list
    snapshot.forEach(function(child) {
        var nameWithId = child.key;
        onlineUsers.push({
            name: nameWithId.split(":")[0],
            uid: nameWithId.split(":")[1],
            gender: nameWithId.split(":")[2],
            time: child.val()
        });
    });
    
    for(var i = onlineUsers.length - 1; i >=0; i--){
        var user = onlineUsers[i];
        if(!players.find(function(p){
            return p.id === user.uid;
        })){
            var newPlayer = new Player(ctx, SPRITES[user.gender], user.uid, filter.clean(user.name), null);
            players.push(newPlayer);
        }
    }
    
    var leavingPlayers = players.filter(function(p){
        return !onlineUsers.find(function(u){
            return u.uid === p.id;
        });
    });
    
    for(var i = 0; i < leavingPlayers.length; i++){
        var p = leavingPlayers[i];
        log(`${p.name} Has Left`, true);
    }
    
    players = players.filter(function(p){
        return onlineUsers.find(function(u){
            return u.uid === p.id;
        });
    });
}

function showPlayers(evt){
    evt.preventDefault();
    var loggedPlayers = onlineUsers.map(function(u){
        return `${u.gender}: ${u.name}`;
    }).join("\n");
    alert(`Logged Players:\n\n${loggedPlayers}`);
}

function getDataSnapshot(child) {
    // returns an object built from a snapshot child to send to the drawing function
    var data = child.val();
    
    return data;
    
    return {
        id: child.key,
        newPlayer: data.newPlayer,
        type: data.type,
        action: data.action,
        damage: data.damage,
        hp: data.hp,
        uid: data.uid,
        name: data.name,
        gender: gender,
        message: data.message,
        deltaX: data.deltaX,
        deltaY: data.deltaY,
        x: data.x,
        y: data.y,
        killCount: data.killCount,
        spriteUrl: data.spriteUrl,
        direction: data.direction,
        timestamp: data.timestamp,
    }
}

function getData(snapshot) {
    // retrieves the new line from the database, build a line object and pass on to a handling function
    var data = null;
    try {
        data = getDataSnapshot(snapshot);
        updatePlayer(data);
    } catch (err) {}
}

function getAllData(snapshot) {
    snapshot.forEach(function(child) {
        var data = null;
        try {
            data = getDataSnapshot(child);
            updatePlayer(data);
        } catch (err) {}
    });
}

function sendData(data) {
    dataRef.push(data);
}

function sendMessage(evt){
    evt.preventDefault();
    var messageInput = document.getElementById("message");
    if(!messageInput.value){
        return;
    }
    sendData({
        type: MESSAGE,
        uid: myPlayer.id,
        name: name,
        gender: gender,
        message: messageInput.value
    });
    messageInput.value = "";
}

class Player {
    constructor(ctx, sprite, id, name, joystick) {
        this.id = id || gUid();
        this.name = name;
        this.hp = 100;
        this.killCount = 0;
        this.ctx = ctx;
        this.spriteUrl = sprite.url;
        this.attackType = sprite.attack;
        this.sprite = new Image();
        this.sprite.src = sprite.url;
        this.currentFrame = 0;
        this.animRowStart = 8;
        this.x = 0;
        this.y = 0;
        this.direction = "UP";
        this.joystick = joystick;
        this.then = new Date();
        this.rowFrames = 6;
        this.action = true;
        this.message = null;
        this.messageFrames = 0;
        this.actionFrames = 0;
        this.currentAction = WALK;
        this.listen = this.listen.bind(this);
    }

    draw() {
        var sx = SPRITE_W;
        var sy = SPRITE_H;
        var sw = SPRITE_W;
        var sh = SPRITE_H;
        var dx = sw;
        var dy = sh;
        var dw = sw;
        var dh = sh;

        // draw shadow
        this.ctx.fillStyle = "black";
        this.ctx.globalAlpha = 0.2;
        bezierCurve(this.ctx, this.x * dx + sw / 2, this.y + sh - 5, sw, sh * 0.3, "fill");
        this.ctx.globalAlpha = 1.0;
        
        // update values to display big sword/spear animation (bigger sprites)
        var bigSprite = (this.attackType === SPEAR && this.currentAction === SPEAR) || (this.attackType === BIG_SWORD && this.currentAction === BIG_SWORD);
        
        var spearMultiplier = bigSprite ? 3:1;
        var spearAdder =  bigSprite ? -64:0;
        
        // draw current player frame
        this.ctx.drawImage(
            this.sprite, // img
            this.currentFrame * sx * spearMultiplier, // source x
            (this.animRowStart) * sy, // source y
            sw * spearMultiplier, // source width
            sh * spearMultiplier, // source height
            this.x * dx + spearAdder, // dx
            this.y, // dy
            dw * spearMultiplier, // dw
            dh * spearMultiplier // dy
        );
        
        // draw player name
        this.ctx.fillStyle = "red";
        this.ctx.fillText(this.name, this.x * dx + sw * 0.3, this.y + sh + 10);
        
        // draw player HP
        if(this.hp > 0){
            this.ctx.fillText(this.killCount, this.x * dx, this.y + 20);
            this.ctx.fillStyle = this.hp > 30 ? "green":"red";
            this.ctx.fillRect(this.x * dx, this.y + 5, 60 * this.hp / 100, 5);
        }
        
        // draw message
        if(this.messageFrames > 0){
            this.ctx.fillStyle = "black";
            this.ctx.fillText(`${this.message}`, this.x * dx + sw * 0.3, this.y);
            this.messageFrames--;
        }
        
        // update current frame for special actions (other then WALK)
        if (this.actionFrames > 0) {
            this.currentFrame = (this.currentFrame+1) % SPRITE_MAP[this.currentAction][FRAMES];
            this.actionFrames--;
            // special action ended -> revert to WALK
            if(this.actionFrames === 0){
                if(this.currentAction === DIE){
                    sendData({
                        type: REVIVE,
                        uid: this.id
                    });
                }
                this.currentAction = WALK;
                this.updateDirectionSprite();
            }
        }
    }

    updateDirectionSprite() {
        this.animRowStart = SPRITE_MAP[this.currentAction][this.direction];
    }

    update(data) {
        this.x = data.x || this.x;
        this.y = data.y || this.y;
        this.killCount = data.killCount || this.killCount;
        this.x += data.deltaX || 0;
        this.y += data.deltaY || 0;
        this.hp = Math.min(data.hp, 100);
        this.direction = data.direction || this.direction;
        if(data.action === UPDATE){
            this.currentFrame = ++this.currentFrame % SPRITE_MAP[this.currentAction][FRAMES];
        }
        this.updateDirectionSprite();
    }
    
    messageStart(data){
        this.message = data.message;
        this.messageFrames = data.message.length * 50;
    }

    actionStart(data){
        this.currentAction = data.action;
        this.actionFrames = SPRITE_MAP[this.currentAction][FRAMES];
        this.currentFrame = 0;
        this.animRowStart = SPRITE_MAP[this.currentAction][this.direction];
    }
    
    takeDamage(data){
        //this.hp -= data.damage;
        this.hp -= DEFAULT_DAMAGE;
    }
    
    addKill(data){
        this.killCount++;
    }
    
    revive(data){
        this.hp = 100;
        this.currentAction = WALK;
    }

    listen() {
        var x = this.x;
        var y = this.y;
        var dx = this.joystick.deltaX() * 0.005;
        var dy = this.joystick.deltaY() * 0.3;
        var direction = this.joystick.direction();
        
        // teleport out of bound player to the oppositr side
        if(x * SPRITE_W < BORDER_LEFT && direction === LEFT){
            x = BORDER_RIGHT / SPRITE_W;
        }
        else if(x * SPRITE_W > BORDER_RIGHT && direction === RIGHT){
            x = BORDER_LEFT / SPRITE_W;
        }
        else if(y > BORDER_BOTTOM && direction === DOWN){
            y = BORDER_TOP;
        }
        else if(y < BORDER_TOP && direction === UP){
            y = BORDER_BOTTOM;
        }
        
        this.now = Date.now();
        var elapsed = this.now - this.then;

        if (elapsed > fpsInterval) {
            this.then = this.now - (elapsed % fpsInterval);
            
            if ((dx || dy) && this.actionFrames <= 0) {
                this.currentFrame = ++this.currentFrame % SPRITE_MAP[this.currentAction][FRAMES];
                
                sendData({
                    type: DELTA,
                    action: UPDATE,
                    uid: this.id,
                    name: this.name,
                    deltaX: dx,
                    deltaY: dy,
                    x: x,
                    y: y,
                    hp: this.hp,
                    killCount: this.killCount,
                    direction: direction
                });
            }
            else if(this.currentAction !== DIE){
                sendData({
                    type: DELTA,
                    action: RECOVER_HP,
                    uid: this.id,
                    name: this.name,
                    deltaX: dx,
                    deltaY: dy,
                    x: x,
                    y: y,
                    hp: this.hp + 0.2,
                    killCount: this.killCount,
                    direction: direction
                });
                
            }
        }
        requestAnimationFrame(this.listen);
    }
}
var KICKED = "Been kicked due to profanity";
// names generated using https://www.fantasynamegenerators.com/username-generator.php
var usernames = ["Guest1","Guest2","Tsardine","Patrio","LaughingMantis","HammerRhino","BlandSage","VirtualMallard","SmartWarlock","CopperDeer","Gringoliath","Coalossus","Weaselfie","Gorillamp","PlayGoddess","MusicalSalmon","IcyGenie","VainChimpanzee","PalePhoenix","EcstaticHydra","Patrio","Geckoco","Hoverlord","Rhinocerious","RichDog","ChillyShade","BruisedHoglet","MaskedGoat","FearlessSalmon","PeaceGirl","Ghostrich","Emufasa","Parascythe","Herogue","GummyWerewolf","HollowDevil","LaughingPig","CheatGeneral","AcrobaticDunker","GothicShadow","Sheeple","Scampirate","Sellamander","Amighost","AfternoonCentaur","GentleIncubus","ComplexFledgling","SubtleFox","FlashyColonel","Leopardon","Priestar","MammothMoth","Muskunk","LaughingHyena","MotherBlizzard","ClumsyGrin","SeaMacaw","AdorablePiggy","ImpulseDaemon","Capeshifter","Recyclops","Rhinocerious","Numbat","WorthyOrange","BabyTermite","BraveBaby","ElderVillain","GracefulBat","HomeCod"];
if (usernames == "KF\Admin->"){
				usernames == "Guests"
}
if (usernames == "Admin->"){
				usernames == "Guests"
}
 if (usernames == "KF->"){
				usernames == "Guests"
}
if (usernames == "KF"){
				usernames == "Guests"
}

