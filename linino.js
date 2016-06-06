Arduino.prototype.isBoardReady = function () {
    return ((this.board !== undefined) 
            && (!this.disconnecting));
};
