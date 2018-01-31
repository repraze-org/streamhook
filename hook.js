const EventEmitter  = require('events');

const { arrayify, isString } = require('./utils');

class HookEventEmmitter extends EventEmitter{
    emit(evenName, obj){
        if(isString(evenName)){
            evenName.split(/\s+/g)
                .forEach(en=>super.emit(en, obj));
        }else{
            super.emit(evenName, obj);
        }
    }
    on(evenName, f){
        if(isString(evenName)){
            evenName.split(/\s+/g)
                .forEach(en=>super.on(en, f));
        }else{
            super.on(evenName, f);
        }
    }
}

class Hook extends HookEventEmmitter{
    constructor(settings){
        super();
        this.settings = this.settings || {};
        Object.assign(this.settings, {
            debug   : true,
            logger  : undefined,

            for     : undefined
        }, settings);

        this.name = this.settings.for;
    }
    emit(type, event = {}){
        event.type = type;
        event.for = this.settings.for;
        if(event.user){
            event.user.for = this.settings.for;
        }
        if(!event.createdAt){
            event.createdAt = new Date();
        }
        if(event.isTest === undefined){
            event.isTest = false;
        }
        console.log(event);
        super.emit(type, event);
        super.emit('event', event);
    }
}

class HookController extends HookEventEmmitter{
    constructor(settings){
        super();
        this.settings = Object.assign({
            // Nothing
        }, settings);

        this.hooks = {};
    }
    use(hooks){
        arrayify(hooks).forEach(hook=>{
            let name = hook.name;
            this.hooks[name] = hook;
        });
    }
    init(loader){
        // init hooks
        Object.values(this.hooks).forEach(hook=>{
            hook.init(loader);
            hook.on('event', this._onEvent.bind(this));
        });
    }
    _onEvent(event){
        let type = event.type;
        if(!type)return;
        let fName = 'on' + type.charAt(0).toUpperCase() + type.slice(1);
        let f = this[fName];
        if(f instanceof Function){
            f.bind(this)(event);
        }
    }
};

module.exports = {
    Hook,
    HookController
};
