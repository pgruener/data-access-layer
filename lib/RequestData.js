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
        this.status = 'pending';
        this.retryable = false;
        this.retryAmount = 0;
        this.clientTimestamp = new Date();
        // https://gist.github.com/gordonbrander/2230317
        this._id = Math.random().toString(36).substr(2, 9) + '_' + this.clientTimestamp.getTime() + '_' + RequestData.requestDataIdCounter;
        this.getActionUrl = function () {
            return _this._actionUrl;
        };
        this.computePayload = function () {
            return _this._payload;
        };
        this.setActive = function () {
            _this.setRetryable(false);
            if (_this.isPending()) {
                _this.status = 'active';
            }
            else if (_this.isError()) {
                _this.status = 'active';
                ++_this.retryAmount;
            }
        };
        this.isPending = function () { return _this.status == 'pending'; };
        this.isError = function () { return _this.status == 'error'; };
        this.isActive = function () { return _this.status == 'active'; };
        this.isFinished = function () { return _this.status == 'finished'; };
        this.setFinished = function () {
            _this.status = 'finished';
        };
        this.setRetryable = function (retryable) {
            _this.retryable = retryable;
        };
        this.isRetryable = function () { return _this.retryable && _this.retryAmount < 100; };
        this.setError = function () {
            _this.status = 'error';
        };
        this.calculateRetryWaitTime = function () { return _this.retryAmount * 500; };
        this.resetRetryAmount = function () {
            _this.retryAmount = 0;
        };
        this.setClientTimestamp = function () {
            _this.clientTimestamp = new Date();
        };
        this._dataProvider = dataProvider;
        ++RequestData.requestDataIdCounter;
    }
    Object.defineProperty(RequestData.prototype, "RetryAmount", {
        get: function () {
            return this.retryAmount;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RequestData.prototype, "Status", {
        get: function () {
            return this.status;
        },
        enumerable: true,
        configurable: true
    });
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
    Object.defineProperty(RequestData.prototype, "ClientTimestamp", {
        get: function () {
            return new Date(this.clientTimestamp.getTime());
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RequestData.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    RequestData.requestDataIdCounter = 0;
    return RequestData;
}());
exports.RequestData = RequestData;
