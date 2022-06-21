"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassUnmodifiableError = void 0;
/**
 * An instance of ClassUnmodifiableError is created and thrown, if someone tries to modify an unmodifiable class.
 *
 * @class ClassUnmodifiableError
 */
var ClassUnmodifiableError = /** @class */ (function () {
    function ClassUnmodifiableError(errorMessage) {
        this.error = new Error(errorMessage);
    }
    ClassUnmodifiableError.prototype.toString = function () {
        this.error.message;
    };
    return ClassUnmodifiableError;
}());
exports.ClassUnmodifiableError = ClassUnmodifiableError;
