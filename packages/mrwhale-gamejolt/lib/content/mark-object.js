"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkObject = void 0;
class MarkObject {
    constructor(type) {
        this.type = type;
        this.attrs = {};
    }
    static fromJsonObj(jsonObj) {
        const obj = new MarkObject(jsonObj.type);
        if (jsonObj.attrs === undefined) {
            obj.attrs = {};
        }
        else {
            obj.attrs = jsonObj.attrs;
        }
        return obj;
    }
    toJsonObj() {
        const jsonObj = {};
        jsonObj.type = this.type;
        if (Object.keys(this.attrs).length > 0) {
            jsonObj.attrs = this.attrs;
        }
        return jsonObj;
    }
}
exports.MarkObject = MarkObject;
