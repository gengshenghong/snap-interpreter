// I take care of overriding everything related to graphics, the DOM, the browser,
// HTML5 Canvases and whatnot.

localStorage = null;

function nop() { return null };

function Canvas(width, height) {
    this.width = width;
    this.height = height;
    this.isFake = true;
    this.context = new FakeContext(width, height);
};

Canvas.prototype.getContext = function() {
    return this.context;
};

Canvas.prototype.addEventListener = nop;

function FakeContext(width, height) {
    this.width = width;
    this.height = height;
    this.isFake = true;
};

document = {
    createElement: function(elementName) {
        if (elementName === 'canvas') {
            return new Canvas(10, 10);
        } else {
            console.error('I don\'t know how to make a ' + elementName);
        }
    },
    body: {
        addEventListener: nop
    }
};

var nullableFunctions = [
    'arc', 
    'beginPath', 
    'bezierCurveTo',
    'clearRect', 
    'clip',
    'closePath', 
    'drawImage',
    'fill', 
    'fillRect', 
    'fillText',
    'lineTo', 
    'moveTo', 
    'quadraticCurveTo',
    'restore',
    'save',
    'scale',
    'stroke',
    'toDataURL',
    'translate'
];

var bogusableFunctions = [
    'createLinearGradient',
    'createRadialGradient',
    'getImageData',
    'measureText'
];

var bogusObject = {
    data: [0,0,0,0],
    width: 0,
    height: 0,
    addColorStop: nop
}

nullableFunctions.forEach(function(each){
    FakeContext.prototype[each] = nop;
});

bogusableFunctions.forEach(function(each){
    FakeContext.prototype[each] = function() { return bogusObject };
})

function Image() {};

HTMLCanvasElement = Canvas;

canvas = new Canvas();

window = { addEventListener: nop };

location = { hash: '' };

