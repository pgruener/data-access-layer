"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var internal_1 = require("./internal");
var internal_2 = require("./internal");
var internal_3 = require("./internal");
/**
 * The QueueWorker is the single entry point for the data access layer to talk to its {@link BackendConnector}.
 * All incoming requests are queued and are running in the sequence they are added (FIFO).
 * The code adding the request can decide, if it should run in a seperate queue by setting a queueName.
 *
 * There is just one instance of QueueWorker per {@link DataCollectionFactory}.
 * @class QueueWorker
 * @see DataCollectionFactory
 */
var QueueWorker = /** @class */ (function () {
    function QueueWorker(backendConnector) {
        var _this = this;
        this.requestQueues = {};
        this.queueTimeoutIds = {};
        this.queueWorkerListeners = [];
        this.removeQueueWorkerListener = function (queueWorkerListener) {
            var index = _this.queueWorkerListeners.indexOf(queueWorkerListener);
            if (index > -1) {
                _this.queueWorkerListeners.splice(index, 1);
            }
        };
        this.addQueueWorkerListener = function (queueWorkerListener) {
            _this.removeQueueWorkerListener(queueWorkerListener);
            _this.queueWorkerListeners.push(queueWorkerListener);
        };
        this.computeActualQueueStates = function () {
            var queueStates = [];
            Object.keys(_this.requestQueues).forEach(function (queueName) {
                var requestInformations = [];
                _this.requestQueues[queueName].requests.forEach(function (requestData) { return requestInformations.push({
                    id: requestData.id,
                    status: requestData.Status,
                    removeFromQueue: function () { return _this.deleteRequestDataFromQueue(requestData, queueName); },
                    repeatRequest: function () { return _this.forceRepeatingRequest(requestData, queueName); }
                }); });
                queueStates.push({
                    queueName: queueName,
                    requestInformations: requestInformations
                });
            });
            return queueStates;
        };
        this.activateQueueWorkerListeners = function () {
            var queueStates = _this.computeActualQueueStates();
            _this.queueWorkerListeners.forEach(function (queueWorkerListener) { return queueWorkerListener(queueStates); });
        };
        this.deleteRequestDataFromQueue = function (requestData, queueName) {
            if (!requestData.isActive()) {
                var queue = _this.requestQueues[queueName].requests;
                var index = queue.indexOf(requestData);
                if (index > -1) {
                    queue.splice(index, 1);
                    _this.activateQueueWorkerListeners();
                    if (index == 0) {
                        var queueTimeoutId = _this.queueTimeoutIds[queueName];
                        window.clearTimeout(queueTimeoutId);
                        if ((queueTimeoutId || !_this.requestQueues[queueName].active) && queue.length > 0) {
                            // The merge issue can happen here unfortunatly
                            _this.doRequestIntern(queueName);
                        }
                    }
                }
            }
        };
        this.forceRepeatingRequest = function (requestData, queueName) {
            if (requestData.isError()) {
                var index = _this.requestQueues[queueName].requests.indexOf(requestData);
                if (index == 0) {
                    requestData.resetRetryAmount();
                    var queueTimeoutId = _this.queueTimeoutIds[queueName];
                    window.clearTimeout(queueTimeoutId);
                    if (queueTimeoutId || !_this.requestQueues[queueName].active) {
                        // The merge issue can happen here unfortunatly
                        _this.doRequestIntern(queueName);
                    }
                }
            }
        };
        this.backendConnector = backendConnector;
    }
    /**
     * Adds the request to the request queue.
     *
     * @method doRequest
     * @param {RequestData} requestData
     * @param {string} [queueName] defaults to 'default' from DEFAULT_BACKEND_CONNECTOR_QUEUE_NAME constant
     */
    QueueWorker.prototype.doRequest = function (requestData, queueName) {
        queueName = queueName == undefined ? internal_1.DEFAULT_BACKEND_CONNECTOR_QUEUE_NAME : queueName;
        if (!this.requestQueues[queueName]) {
            this.requestQueues[queueName] = {
                requests: [],
                active: false
            };
        }
        var queue = this.requestQueues[queueName].requests;
        queue.push(requestData);
        if (!this.requestQueues[queueName].active) {
            this.doRequestIntern(queueName);
        }
    };
    /**
     * Gets the first RequestData object from the queue with the given queue name
     * and triggers the {@link BackendConnector} to do the request.
     *
     * @method doRequestIntern
     * @param {string} queueName to be processed
     */
    QueueWorker.prototype.doRequestIntern = function (queueName) {
        var _this = this;
        this.queueTimeoutIds[queueName] = undefined;
        var requestData = this.requestQueues[queueName].requests[0];
        // if (!requestData) {
        //   setActive(false)
        //   return;
        // }
        this.requestQueues[queueName].active = true;
        if (requestData) { // Because we can now remove requests in the queue with this.deleteRequestDataFromQueue
            if (!requestData.isPending() && !requestData.isError()) {
                this.requestQueues[queueName].active = false;
                return;
            }
            requestData.setActive();
            this.activateQueueWorkerListeners();
            if (requestData instanceof internal_2.DataModelRequestData) {
                requestData.dataModel.informAboutRequest(requestData);
            }
            this.backendConnector.doRequest(requestData).done(function (response) {
                var hasResponse = response != null;
                if (hasResponse) {
                    requestData.setClientTimestamp();
                    if (response instanceof Array) {
                        requestData.handleResponse(response);
                    }
                    else {
                        requestData.handleResponse(response);
                    }
                }
                requestData.setFinished();
                _this.onAfterRequestDone(queueName, !hasResponse);
            }, function (reason, retry) {
                requestData.setError();
                _this.activateQueueWorkerListeners();
                if (requestData.isRetryable()) {
                    console.log("Rejected. Retrying ... (" + requestData.RetryAmount + ") tries", reason);
                    _this.queueTimeoutIds[queueName] = window.setTimeout(function () { return _this.doRequestIntern(queueName); }, requestData.calculateRetryWaitTime());
                }
                else {
                    _this.requestQueues[queueName].active = false;
                    console.log('Rejected.', reason);
                }
            });
        }
        else {
            this.requestQueues[queueName].active = false;
        }
    };
    /**
     * Removes the first object from the queue with the given queue name and starts
     * the next queue cycle, if there are objects left in the queue.
     *
     * @method onAfterRequestDone
     * @param {string} queueName
     * @param {boolean} [skipReduceQueue]
     */
    QueueWorker.prototype.onAfterRequestDone = function (queueName, skipReduceQueue) {
        var _this = this;
        var queue = this.requestQueues[queueName].requests;
        if (!skipReduceQueue) {
            queue.shift();
        }
        this.activateQueueWorkerListeners();
        if (queue.length > 0) {
            if (queue[0] instanceof internal_3.UrlRequestData) {
                this.doRequestIntern(queueName);
            }
            else {
                this.queueTimeoutIds[queueName] = window.setTimeout(function () { return _this.doRequestIntern(queueName); }, 1100); //Bad Workorround to don't have the merge issues with time stamps
            }
        }
        else {
            this.requestQueues[queueName].active = false;
        }
    };
    return QueueWorker;
}());
exports.QueueWorker = QueueWorker;
