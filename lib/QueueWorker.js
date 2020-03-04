"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var internal_1 = require("./internal");
var internal_2 = require("./internal");
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
        this.requestQueues = {};
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
        var queue = this.requestQueues[queueName];
        if (!queue) {
            queue = this.requestQueues[queueName] = [];
        }
        queue.push(requestData);
        if (queue.length == 1) {
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
        var queue = this.requestQueues[queueName];
        var requestData = queue[0];
        if (!requestData.isPending() && !requestData.isError()) {
            return;
        }
        requestData.setActive();
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
            _this.onAfterRequestDone(queueName, !hasResponse);
            requestData.setFinished();
        }, function (reason, retry) {
            requestData.setError();
            if (requestData.isRetryable()) {
                console.log("Rejected. Retrying ... (" + requestData.RetryAmount + ") tries", reason);
                setTimeout(function () { return _this.doRequestIntern(queueName); }, requestData.calculateRetryWaitTime());
            }
            else {
                console.log('Rejected.', reason);
            }
        });
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
        var queue = this.requestQueues[queueName];
        if (!skipReduceQueue) {
            queue.shift();
        }
        if (queue.length > 0) {
            // this.doRequestIntern(queueName)
            setTimeout(function () { return _this.doRequestIntern(queueName); }, 1100); //Bad Workorround to don't have the merge-issues with timesteps
        }
    };
    return QueueWorker;
}());
exports.QueueWorker = QueueWorker;
