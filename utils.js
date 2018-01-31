const dt        = require('delta-time');
const axios     = require('axios');

const poll = function(url, cb, settings){
    settings = Object.assign({
        interval : dt('30s'),
        direct : true,
        urlParams : {}
    }, settings);
    let inited = false;

    let fetcher = async ()=>{
        try {
            let res = await axios.get(url, settings.urlParams);
            if(cb instanceof Function){
                cb(res.data, inited);
                inited = true;
            }
        }catch(e){
            console.error("SOME ERROR");
        }
    };
    if(settings.direct){fetcher();}
    setInterval(fetcher, settings.interval);
};

const isString = function(s){
    return typeof s === 'string' || s instanceof String;
};

const isNumeric = function(n){
  return !isNaN(parseFloat(n)) && isFinite(n);
};

const toFloat = function(amount){
    if(isNumeric(amount)){
        return parseFloat(amount);
    }
    if(isString(amount)){
        return parseFloat(amount.replace(/[^0-9.]/g, ''));
    }
    return NaN;
};

const toInt = function(){
    if(isNumeric(amount)){
        return parseInt(amount, 10);
    }
    return NaN;
}

const arrayify = function(arr){
    if(!Array.isArray(arr)){
        if(arr === undefined){
            arr = [];
        }else{
            arr = [arr];
        }
    }
    return arr;
};

module.exports = {
    arrayify,
    poll,
    isString,
    isNumeric,
    toFloat,
    toInt
};
