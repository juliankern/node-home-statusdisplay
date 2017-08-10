const utils = global.req('util');
const gpio = global.req('lib/gpio');

module.exports = async (SmartNodeClientPlugin) => {
    let displayTimeout;
    let config = SmartNodeClientPlugin.config;
    let socket = SmartNodeClientPlugin.socket;

    console.log('loaded node-home-statusdisplay', config);
    
    return {
        load,
        unload
    }
    
    async function load() {
        console.log('pluginloaded')
        socket.emit('pluginloaded');
        
        if (config.display && config.display.backlight) { 
            gpio.setup(config.display.backlight, gpio.DIR_OUT);
        }
        
        if (config.button) {
            gpio.on('change', async (channel, value) => {
                if (channel === config.button && value) {
                    if (displayTimeout) clearTimeout(displayTimeout);
                    
                    await gpio.write(config.display.backlight, true);
                    
                    displayTimeout = setTimeout(() => {
                        gpio.write(config.display.backlight, false);
                    }, (config.display.timeout || 10) * 1000);
                }
            });
            gpio.setup(config.button, gpio.DIR_IN, gpio.EDGE_BOTH);
        }
        
        if (config.display) {
            let lcd = new (require('./lib/lcd.js'))(Object.assign({cols: 8, rows: 2}, config.display));
            
            socket.on('render', (globals, cb) => {
                console.log('trying to render display with globals', globals);
                let lines = config.lines.map((line) => {
                    return line.replace(/{{([\w\.]+)}}/g, (m, p1) => {
                        return utils.getValueByPath(globals, p1);
                    })
                });

                console.log('render display with lines', lines);
                // 
                cb();
            })
        }

        return true;
    }

    function unload() {
        if (gpio) {
            gpio.destroy();
        }

        return true;
    }
}
