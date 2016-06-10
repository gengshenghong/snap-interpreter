var path = process.argv.filter(function(any) { return any.substring(2,8) === '/dev/tty' }),
    port = process.argv.filter(function(any) { return Number(any).toString() === any }),
    lininoMode = !port[0] && process.argv.indexOf('--linino') > -1,
    debugMode = !port[0] && process.argv.indexOf('--debug') > -1,
    WebSocketServer = require('ws').Server,
    webSocketServer = new WebSocketServer({ port: port[0] || 8888 }),
    board = {},
    commands = {};

if (lininoMode) {
    require('./ideino-linino-lib/utils/proto.js');
    var linino = require('./ideino-linino-lib');
    board = new linino.Board();
    board.connect(function () {
        board.pins = {};
        board.analogPins = {};
        board.MODES.ANALOG = 'A';
        console.log('MCU ready\nLininoIO mode');
    });
} else {
    var firmata = require('firmata');
    board = new firmata.Board(
            path[0] || '/dev/ttySAMD',
            function() { console.log('MCU ready\nFirmata mode'); });
}

webSocketServer.on('connection', function(ws) {
    console.log('Websocket client connected');
    ws.on('message', function(message) {
        if (debugMode) { console.log(message); }
        var parsedMessage;
        try {
            parsedMessage = JSON.parse(message);
        } catch (err) {
            if (message === 'Hello Tian!') {
                console.log(':)');
            } else {
                console.error('unparseable message:\n' + err);
            }
            return;
        }
        commands[parsedMessage.command].apply(null, parsedMessage.args.concat(ws));
    });
});

commands.pinMode = function (pin, mode) {
    if (mode !== 'A') {
        board.pinMode(lininoMode ? pin.toString() : pin, mode);
    }

    if (!board.pins[pin]) {
        board.pins[pin] = {};
    }

    board.pins[pin].mode = mode;
};

commands.servoWrite = function (pin, value) {
    if (!board.pins[pin] || board.pins[pin].mode != board.MODES.SERVO) {
        if (debugMode) { console.log('setting pin mode to servo'); }
        commands.pinMode(lininoMode ? 'S' + pin : pin, board.MODES.SERVO);
    }

    var numericValue;

    switch (value[0]) {
        case 'clockwise':
            numericValue = 1200;
            break;
        case 'counter-clockwise':
            numericValue = 1700;
            break;
        case 'stopped':
            numericValue = 1500;
            break;
        case 'disconnected':
            commands.digitalWrite(pin, false);
            return null;
        default:
            numericValue = value;
            break;
    }

    board.servoWrite(lininoMode ? 'S' + pin : pin, parseInt(numericValue));
};

commands.reportAnalogReading = function (pin, ws) {
    realPin = lininoMode ? board.pin.analog[pin.toString()] : board.pins[board.analogPins[pin]];

    if (!board.pins[realPin] || realPin.mode != board.MODES.ANALOG) {
        if (debugMode) { console.log('setting pin mode to analog input'); }
        commands.pinMode(realPin, board.MODES.ANALOG);
        board.analogRead(realPin, function(value) { 
            board.pins[realPin].value = value;
        });
    }
    ws.send(JSON.stringify({ pin: realPin, value: board.pins[realPin].value }));
};

commands.reportDigitalReading = function (pin, ws) {
    if (!board.pins[pin] || board.pins[pin].mode != board.MODES.INPUT) {
        if (debugMode) { console.log('setting pin mode to digital input'); }
        commands.pinMode(pin, board.MODES.INPUT);
        board.digitalRead(pin, function(value) { 
            board.pins[pin].value = value;
        });
    } 
    ws.send(JSON.stringify({ pin: pin, value: board.pins[pin].value === 1 }));
};

commands.digitalWrite = function (pin, booleanValue) {
    if (!board.pins[pin] || board.pins[pin].mode != board.MODES.OUTPUT) {
        if (debugMode) { console.log('setting pin mode to digital output'); }
        commands.pinMode(pin, board.MODES.OUTPUT);
    }
    board.digitalWrite(lininoMode ? pin.toString() : pin, booleanValue ? board.HIGH : board.LOW);
};

commands.pwmWrite = function (pin, value) {
    if (!board.pins[pin] || board.pins[pin].mode != board.MODES.PWM) {
        commands.pinMode(lininoMode ? 'P' + pin : pin, board.MODES.PWM);
        if (debugMode) { console.log('setting pin mode to PWM'); }
    }
    board.analogWrite(lininoMode ? 'P' + pin : pin, value);
};
