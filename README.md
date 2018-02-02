# streamhook

A hook system to aggregate events from multiple source.

Allows you to listen to events from multiple APIs or websockets and give consistent output across.

## Current build in hooks

 - **twitch** (TwitchHook) :
    - chat
    - tip (cheer)
    - host (hosted)
    - subscription
    - join
    - leave (part)
    - follow
    - online
    - offline
 - **streamtip** (StreamtipHook) :
    - tip (newTip)
 - **lastfm** (LastfmHook) :
    - music

## Usage

 > The package is in early stages, the fundamental architecture might evolve quickly.

### Single hook
``` js
const { TwitchHook } = require('streamhook');

let hook = new TwitchHook({
    channel : "mychannel"   // your twitch channel
});
hook.on('chat', event=>{    // listen to one event
    console.log(event);
});
hook.init(_=>{              // provide auth configs through function, useful for injection from file
    return {
        "username"  : "myusername",
        "password"  : "oauth:something",
        "client_id" : "myclientid"
    };
});
```

### Hook controller
``` js
const { TwitchHook, LastfmHook, HookController } = require('streamhook');

let twitchHook = new TwitchHook({
    channel : "mychannel"   // your twitch channel
});
let lastfmHook = new LastfmHook({
    user    : "myusername"
});

let controller = new HookController();
controller.use(twitchHook);
controller.use(lastfmHook);

controller.init(forHook=>{
    // return ...; // return auth config based on name
});

controller.on('chat', ()=>{}); // twitch
controller.on('music', ()=>{}); // lastfm
```

### Custom Hook
``` js
const { Hook } = require('streamhook');

class MyHook extends Hook{
    constructor(settings){
        super(Object.assign({
            for     : "myhook",

            // extra params
            config  : "myhook.json",
        }, settings));
    }
    async init(loader){
        setInterval(()=>{
            let event = {
                // content
            };
            this.emit("myevent", event);
        }, 10000);
    }
}
```

If you are using standard types, follow the same event definition. I you think your custom hook should be added with the standard ones, submit an issue.
