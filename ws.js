var path = process.argv.filter(function(any) { return any.substring(0,8) === '/dev/tty' }),
    port = process.argv.filter(function(any) { return Number(any).toString() === any }),
    WebSocketServer = require('ws').Server,
    webSocketServer = new WebSocketServer({ port: port ? port[0] : 8080 }),
    firmata = require('firmata'),
    board = new firmata.Board(
        path ? path[0] : '/dev/ttySAMD',
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
        }
        commands[parsedMessage.command].apply(null, parsedMessage.args.concat(ws));
    });
});


commands.setPinMode = function (pin, mode) {
    switch(mode[0]) {
        case 'digital input': val = board.MODES.INPUT; break;
        case 'digital output': val = board.MODES.OUTPUT; break;
        case 'PWM': val = board.MODES.PWM; break;
        case 'servo': val = board.MODES.SERVO; break;
        case 'analog input': val = board.MODES.ANALOG; break;
    }
    if (board.pins[pin].supportedModes.indexOf(val) > -1) {	
        board.pinMode(pin, val);
    }
}

commands.servoWrite = function (pin, value) {
    if (board.pins[pin].mode != board.MODES.SERVO) {
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
        board.analogRead(pin, function(value) { 
            board.pins[board.analogPins[pin]].value = value;
        });
    }
    ws.send(JSON.stringify({ pin: pin, value: board.pins[board.analogPins[pin]].value }));
}

commands.reportDigitalReading = function (pin, ws) {
    if (board.pins[pin].mode != board.MODES.INPUT) {
        board.pinMode(pin, board.MODES.INPUT);
        board.digitalRead(pin, function(value) { 
            board.pins[pin].value = value;
        });
    } 
    ws.send(JSON.stringify({ pin: pin, value: board.pins[pin].value === 1 }));
}

commands.digitalWrite = function (pin, booleanValue) {
    if (board.pins[pin].mode != board.MODES.OUTPUT) {
        board.pinMode(pin, board.MODES.OUTPUT);
    }
    board.digitalWrite(pin, booleanValue ? board.HIGH : board.LOW);
}

commands.pwmWrite = function (pin, value) {
    if (board.pins[pin].mode != board.MODES.PWM) {
        board.pinMode(pin, board.MODES.PWM);
    }
    board.analogWrite(pin, value);
}
