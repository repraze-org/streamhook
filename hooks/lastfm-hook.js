const EventEmitter  = require('events');
const dt            = require('delta-time');

const { poll }      = require('../utils');
const { Hook }      = require('../hook');

class LastfmHook extends Hook{
    constructor(settings){
        super(Object.assign({
            for         : "lastfm",

            user        : "repraze",
            coverSize   : "medium",
            config      : "lastfm.json",
        }, settings));

        this.client = null;
    }
    async init(loader){
        let config = await loader(this.settings.config);

        // playing polling
        {
            let playing = null;
            poll(`http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${this.settings.user}&api_key=${config.client_id}&format=json&limit=1`, (res, inited)=>{
                let latest = res.recenttracks.track[0];
                if(latest && latest['@attr'] && latest['@attr']['nowplaying']){
                    let name    = latest['name'];
                    let artist  = latest['artist']['#text'];
                    let album   = latest['album']['#text'];
                    let cover   = latest['image'].filter(c=>c['size']===this.settings.coverSize)[0]['#text'];

                    let id      = name+artist+album;

                    if(id !== playing){
                        playing = id;
                        let event = {
                            name,
                            artist,
                            album,
                            cover
                        };
                        this.emit("music", event);
                    }
                }
            }, {
                interval : dt('5sec')
            });
        }
    }
}

module.exports = LastfmHook;
