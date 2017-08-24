module.exports = async (SmartNodeServerPlugin) => {
    let socket = SmartNodeServerPlugin.socket;
    let lines = ['',''];
    
    return {
        load,
        unload,
        unpair
    }

    function unpair() {}
    
    function load() {
        SmartNodeServerPlugin.addDisplayData('displayline1', {
            description: "Line 1",
            type: "string",
            value: lines[0]
        });

        SmartNodeServerPlugin.addDisplayData('displayline2', {
            description: "Line 2",
            type: "string",
            value: lines[1]
        });

        _initRender(SmartNodeServerPlugin.getGlobals());
        
        SmartNodeServerPlugin.on('globalsChanged', (changed) => {
            _initRender(SmartNodeServerPlugin.getGlobals());
        });
    }
    
    function unload() {
        SmartNodeServerPlugin.removeAllListeners('globalsChanged');
    }
    
    function _initRender(data) {
        socket.emit('render', data, (renderedLines) => {
            lines = renderedLines;
            global.muted('Display rendered', lines);

            SmartNodeServerPlugin.updateDisplayData('displayline1', {
                value: lines[0]
            });

            SmartNodeServerPlugin.updateDisplayData('displayline2', {
                value: lines[1]
            });
        });
    }
}