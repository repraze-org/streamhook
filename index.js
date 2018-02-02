const EventEmitter = require('events');

const {Hook, HookController} = require('./hook');

const TwitchHook = require('./hooks/twitch-hook');
const StreamtipHook = require('./hooks/streamtip-hook');
const LastfmHook = require('./hooks/streamtip-hook');

module.exports = {
    // Core classes
    Hook,
    HookController,

    // Built in hooks
    TwitchHook,
    StreamtipHook,
    LastfmHook
};
