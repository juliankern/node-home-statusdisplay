const pkg = require('./package.json');

const utils = global.req('util');
const gpio = global.req('lib/gpio');

module.exports = async (SmartNodeClientPlugin) => {
    let displayTimeout;
    let config = SmartNodeClientPlugin.config;
    let socket = SmartNodeClientPlugin.socket;
    
    return {
        init,
        load,
        unload,
        unpair
    }
    
    function init() {
        return [pkg, (data) => {
            // console.log('init done', data);
        }];
    }

    function unpair() {

    }

    async function load() {
        global.muted('smartnode-statusdisplay loaded')

        if (config.lcd && config.backlight) { 
            gpio.setup(config.backlight, gpio.DIR_OUT);
        }
        
        if (config.button) {
            gpio.on('change', async (channel, value) => {
                if (channel === config.button && value) {
                    if (displayTimeout) clearTimeout(displayTimeout);
                    
                    await gpio.write(config.backlight, true);
                    
                    displayTimeout = setTimeout(() => {
                        gpio.write(config.backlight, false);
                    }, (config.timeout || 10) * 1000);
                }
            });
            gpio.setup(config.button, gpio.DIR_IN, gpio.EDGE_BOTH);
        }
        
        if (config.lcd) {
            let lcd = new (require('./lib/lcd.js'))(Object.assign({cols: 8, rows: 2}, config.lcd));
            
            socket.on('render', (globals, cb) => {
                let lines = config.lines.map((line) => {
                    return line.replace(/{{([\w\.]+)}}/g, (m, p1) => {
                        return utils.getValueByPath(globals, p1);
                    })
                });

                console.log('render display with lines', lines);

                cb(lines);
            })
        }
        
        socket.emit('pluginloaded');

        return true;
    }

    function unload() {
        if (gpio) {
            gpio.destroy();
        }

        return true;
    }
}
