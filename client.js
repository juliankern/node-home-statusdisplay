let config;
let gpio;
let displayTimeout;

module.exports = (cfg) => {
    config = cfg;
    console.log('loaded node-home-statusdisplay', config);
    
    if (config.display || config.button) {
        try {
            gpio = require('rpi-gpio');
        } catch(e) {
            gpio = { 
                setup: () => {} ,
                on: () => {},
                destroy: () => {}
            }
        }
    }
    
    return {
        load,
        unload
    }
}

function load(socket) {
    console.log('pluginloaded')
    socket.emit('pluginloaded');
    
    if (config.display) {
        gpio.setup(config.display, gpio.DIR_OUT);
    }
    
    if (config.button) {
        gpio.on('change', async (channel, value) => {
            if (channel === config.button && value) {
                if (displayTimeout) clearTimeout(displayTimeout);
                
                await gpio.write(config.display, true);
                
                displayTimeout = setTimeout(() => {
                    gpio.write(config.display, false);
                }, (config.display.timeout || 10) * 1000);
            }
        });
        gpio.setup(config.button, gpio.DIR_IN, gpio.EDGE_BOTH);
    }
}

function unload(socket) {
    socket.emit('pluginunloaded');
    
    if (gpio) {
        gpio.destroy();
    }
}