let config;
let Lcd;
let lcd;
let gpio;
let displayTimeout;

module.exports = (cfg) => {
    config = cfg;
    console.log('loaded node-home-statusdisplay', config);
    
    if ((config.display && config.display.backlight) || config.button) {
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

    if (config.display) {
        Lcd = require('./lib/lcd.js');
    }
    
    return {
        load,
        unload
    }
}

function load(socket) {
    console.log('pluginloaded')
    socket.emit('pluginloaded');
    
    if (config.display && config.display.backlight) {
        gpio.setup(config.display.backlight, gpio.DIR_OUT);
    }

    if (config.display) {
        lcd = new Lcd(Object.assign({cols: 8, rows: 2}, config.display));
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
}

function unload(socket) {
    if (gpio) {
        gpio.destroy();
    }
}