"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlDetector = void 0;
const twitter_text_1 = require("twitter-text");
class UrlDetector {
    static detect(text, offset) {
        const twturls = twitter_text_1.extractUrlsWithIndices(text, {
            extractUrlsWithoutProtocol: true,
        });
        return twturls.map((i) => {
            return {
                index: i.indices["0"] + offset,
                match: i.url,
            };
        });
    }
}
exports.UrlDetector = UrlDetector;
