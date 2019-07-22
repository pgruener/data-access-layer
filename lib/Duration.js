"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Duration class is used to keep store a duration in millis.
 * It later may provide static convenient methods like Duration.fromDay(1)
 * to create more readable code.
 *
 * @class Duration
 */
var Duration = /** @class */ (function () {
    function Duration(millis) {
        this.millis = millis;
    }
    Object.defineProperty(Duration.prototype, "milliSeconds", {
        /**
         * Attribute accessor for milliSeconds
         */
        get: function () {
            return this.millis;
        },
        enumerable: true,
        configurable: true
    });
    return Duration;
}());
exports.Duration = Duration;
