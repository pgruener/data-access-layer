"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlRequestData = void 0;
var internal_1 = require("./internal");
/**
 * @class UrlRequestData
 * @extends RequestData
 */
var UrlRequestData = /** @class */ (function (_super) {
    __extends(UrlRequestData, _super);
    function UrlRequestData(dataProvider, url, scopeName) {
        var _this = _super.call(this, dataProvider) || this;
        _this._actionUrl = { url: url, method: 'GET' };
        _this._scopeName = scopeName;
        return _this;
    }
    UrlRequestData.prototype.handleResponse = function (response) {
        _super.prototype.handleResponse.call(this, response);
        this._dataProvider.onLoadedData(this);
    };
    Object.defineProperty(UrlRequestData.prototype, "scopeName", {
        /**
         * Attribute accessor for scopeName
         */
        get: function () {
            return this._scopeName;
        },
        enumerable: false,
        configurable: true
    });
    return UrlRequestData;
}(internal_1.RequestData));
exports.UrlRequestData = UrlRequestData;
