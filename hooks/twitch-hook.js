const EventEmitter  = require('events');
const tmi           = require('tmi.js');

const {
    poll,
    isString,
    isNumeric,
    toFloat,
    toInt
} = require('../utils');
const { Hook }      = require('../hook');

class TwitchHook extends Hook{
    constructor(settings){
        super(Object.assign({
            for     : "twitch",

            channel : "reprazelive",
            config  : "twitch.json",
        }, settings));

        this.client = null;
    }
    async init(loader){
        let config = await loader(this.settings.config);
        let identity = {
            username : config.username,
            password : config.password,
        };
        this.headers = {
            "Authorization" : config.password,
            "Client-ID" : config.client_id,
        };

        // init client
        let options = {
            options : {
                debug : this.settings.debug,
            },
            connection : {
                reconnect: true,
            },
            identity : identity,
            channels : [this.settings.channel]
        };
        this.client = new tmi.client(options);

        this.initEvents();
        this.initPollings();

        this.client.connect();
    }
    initEvents(){
        // chat event
        this.client.on("chat", (channel, userstate, message, self)=>{
            let event = {
                user : {
                    name : userstate['display-name'],
                    username : userstate['username'],
                },
                message : message
            };
            this.emit("chat", event);
        });
        // tip event
        this.client.on("cheer", (channel, userstate, message)=>{
            let amount = toFloat(userstate.bits);
            let event = {
                user : {
                    name : userstate['display-name'],
                    username : userstate['username'],
                },
                amount : amount,
                currency : "bits",
                formattedAmount : `${amount} bits`,
                message : message
            };
            this.emit("tip", event);
        });
        // host event
        this.client.on("hosted", (channel, username, viewers, autohost)=>{
            viewers = toInt(viewers);
            let event = {
                user : {
                    username : username,
                },
                viewers : viewers
            };
            this.emit("host", event);
        });
        // subscription event
        this.client.on("subscription", (channel, username, method, message, userstate)=>{ // TODO plan?
            let event = {
                user : {
                    name : userstate['display-name'],
                    username : userstate['username'],
                },
                message : message
            };
            this.emit("subscription", event);
        });
        // TODO resub
        // TODO join / leave ?

        let joined = new Set();
        this.client.on("join", (channel, username)=>{
            if(joined.has(username)) return;
            joined.add(username);

            let event = {
                user : {
                    username : username,
                },
            };
            this.emit("join", event);
        });

        this.client.on("part", (channel, username)=>{
            if(!joined.has(username)) return;
            joined.delete(username);

            let event = {
                user : {
                    username : username,
                },
            };
            this.emit("leave", event);
        });


    }
    initPollings(){
        // follow polling
        {
            let followers = new Set();
            poll(`https://api.twitch.tv/kraken/channels/${this.settings.channel}/follows`, (res, inited)=>{
                res.follows.forEach(follow=>{
                    let user = follow.user;
                    let username = user.name;
                    if(!followers.has(username)){
                        followers.add(username);
                        if(inited){
                            let event = {
                                user : {
                                    name : user['display_name'],
                                    username : user['name']
                                }
                            };
                            this.emit("follow", event);
                        }
                    }
                });
            }, {
                urlParams : {
                    params : {
                        limit : 50
                    },
                    headers : this.headers
                }
            });
        }

        // online polling
        {
            let live = false;
            poll(`https://api.twitch.tv/kraken/streams/${this.settings.channel}`, (res, inited)=>{
                let hasStream = !!res.stream;
                if(hasStream && !live){
                    let event = {
                        createdAt : new Date(res.stream.created_at)
                    }
                    this.emit("online", event);
                }else if(!hasStream && live){
                    let event = {
                        // Nothing
                    }
                    this.emit("offline", event);
                }
                live = hasStream;
            }, {
                urlParams : { headers : this.headers }
            })
        }
    }
}

module.exports = TwitchHook;
