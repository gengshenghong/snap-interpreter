var path = process.argv.filter(function(any) { return any.substring(0,8) === '/dev/tty' }),
    port = process.argv.filter(function(any) { return Number(any).toString() === any });
    WebSocketServer = require('ws').Server,
    webSocketServer = new WebSocketServer({ port: port[0] || 8080 }),
    firmata = require('firmata'),
    board = new firmata.Board(
        path[0] || '/dev/ttySAMD',
        function() { console.log('MCU ready'); }),
    commands = {};

webSocketServer.on('connection', function(ws) {
    console.log('Websocket client connected');
    ws.on('message', function(message) {
        console.log(message);
        var parsedMessage;
        try {
            parsedMessage = JSON.parse(message);
        } catch (err) {
            console.error('unparseable message:\n' + err);
            return;
        }
        commands[parsedMessage.command].apply(null, parsedMessage.args.concat(ws));
    });
});

commands.servoWrite = function (pin, value) {
    if (board.pins[pin].mode != board.MODES.SERVO) {
        console.log('setting pin mode to servo');
        board.pinMode(pin, board.MODES.SERVO);
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

    board.servoWrite(pin, numericValue);
 
}

commands.reportAnalogReading = function (pin, ws) {
    if (board.pins[board.analogPins[pin]].mode != board.MODES.ANALOG) {
        board.pinMode(board.analogPins[pin], board.MODES.ANALOG);
        console.log('setting pin mode to analog input');
        board.analogRead(pin, function(value) { 
            board.pins[board.analogPins[pin]].value = value;
        });
    }
    ws.send(JSON.stringify({ pin: pin, value: board.pins[board.analogPins[pin]].value }));
}

commands.reportDigitalReading = function (pin, ws) {
    if (board.pins[pin].mode != board.MODES.INPUT) {
        board.pinMode(pin, board.MODES.INPUT);
        console.log('setting pin mode to digital input');
        board.digitalRead(pin, function(value) { 
            board.pins[pin].value = value;
        });
    } 
    ws.send(JSON.stringify({ pin: pin, value: board.pins[pin].value === 1 }));
}

commands.digitalWrite = function (pin, booleanValue) {
    if (board.pins[pin].mode != board.MODES.OUTPUT) {
        board.pinMode(pin, board.MODES.OUTPUT);
        console.log('setting pin mode to digital output');
    }
    board.digitalWrite(pin, booleanValue ? board.HIGH : board.LOW);
}

commands.pwmWrite = function (pin, value) {
    if (board.pins[pin].mode != board.MODES.PWM) {
        board.pinMode(pin, board.MODES.PWM);
        console.log('setting pin mode to PWM');
    }
    board.analogWrite(pin, value);
}
