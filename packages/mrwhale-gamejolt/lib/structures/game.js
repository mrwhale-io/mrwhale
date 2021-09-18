"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
class Game {
    constructor(data) {
        Object.assign(this, data);
    }
    toString() {
        return this.title;
    }
}
exports.Game = Game;
