module.exports = async (SmartNodePlugin) => {
    let config = SmartNodePlugin.config;
    let storage = SmartNodePlugin.storage;
    let socket = SmartNodePlugin.socket;
    
    return {
        load,
        unload
    }
    
    function load() {
        _initRender(SmartNodePlugin.getGlobals());
        
        SmartNodePlugin.on('globalsChanged', () => {
            _initRender(SmartNodePlugin.getGlobals());
        });
    }
    
    function unload() {
        SmartNodePlugin.removeAllListeners('globalsChanged');
    }
    
    function _initRender(data) {
        console.log('_initRender', data);
        socket.emit('render', data, () => {
            global.muted('Display rendered');
        });
    }
}