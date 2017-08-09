let Lcd;

try {
    Lcd = require('lcd');
} catch(e) {
    global.warn('Fake LCD!');
    
    Lcd = function(options) {
        
    }
}

module.exports = Lcd;