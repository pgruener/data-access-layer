"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @class DataModelRequestMetaData
 */
var DataModelRequestMetaData = /** @class */ (function () {
    function DataModelRequestMetaData(requestData) {
        this._requestData = requestData;
    }
    Object.defineProperty(DataModelRequestMetaData.prototype, "requestData", {
        /**
         * Attribute accessor for requestData
         */
        get: function () {
            return this._requestData;
        },
        enumerable: true,
        configurable: true
    });
    return DataModelRequestMetaData;
}());
exports.DataModelRequestMetaData = DataModelRequestMetaData;
