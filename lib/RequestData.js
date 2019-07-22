"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * RequestData contains every information needed for a {@link BackendConnector} to decide,
 * what kind of request to the backend (i.e. server, local storage, ...) is needed th perform the
 * desired action. It acts as a container object and delegates the backends response to the
 * interested internal code.
 *
 * There are some specific subclasses of RequestData, which differentiate the behavior.
 *
 * @class RequestData
 * @see BackendConnector
 * @see UrlRequestData
 * @see ActionRequestData
 */
var RequestData = /** @class */ (function () {
    function RequestData(dataProvider) {
        var _this = this;
        this.getActionUrl = function () {
            return _this._actionUrl;
        };
        this.computePayload = function () {
            return _this._payload;
        };
        this._dataProvider = dataProvider;
    }
    /**
     * Sets response and triggers further internal usage.
     *
     * @method handleResponse
     * @param {ObjectMap|ObjectMap[]} response
     */
    RequestData.prototype.handleResponse = function (response) {
        if (this._response) {
            throw new Error('Handling response is only possible once.');
        }
        else {
            this._response = this._dataProvider.config.unwrapFromServer(this, response);
        }
    };
    Object.defineProperty(RequestData.prototype, "response", {
        /**
         * Attribute accessor for response
         */
        get: function () {
            return this._response;
        },
        enumerable: true,
        configurable: true
    });
    return RequestData;
}());
exports.RequestData = RequestData;
