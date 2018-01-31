const EventEmitter  = require('events');
const io            = require('socket.io-client');

const { toFloat }   = require('../utils');
const { Hook }      = require('../hook');

class StreamtipHook extends Hook{
    constructor(settings){
        super(Object.assign({
            for     : "streamtip",

            config  : "streamtip.json",
        }, settings));

        this.client = null;
    }
    async init(loader){
        let config = await loader(this.settings.config);

        this.client = io.connect('https://streamtip.com', {
            query: 'client_id='+encodeURIComponent(config.client_id)+'&access_token='+encodeURIComponent(config.access_token)
        });

        this.client.on('authenticated', function() {
            console.log('Streamtip: authenticated');
        });

        this.client.on('error', function(err) {
            if(err === '401::Access Denied::') {
                console.log('Streamtip: authentication failed');
            }
        });

        this.client.on('newTip', data=>{
            let amount = toFloat(data.amount);
            let event = {
                user : {
                    username : data['username'],
                },
                amount : amount,
                currency : data['currencyCode'],
                formattedAmount : `${data['currencySymbol']}${amount}`,
                message : data['note']
            };
            this.emit("tip", event);
        });
    }
}

module.exports = StreamtipHook;
