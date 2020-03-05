"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var internal_1 = require("./internal");
var internal_2 = require("./internal");
var internal_3 = require("./internal");
/**
 * An instance of DataCollectionFactory is used to operate with the core concepts of the data access layer.
 * It provides access to {@link DataCollection|DataCollections} and {@link DataModel|DataModels}
 *
 * @class DataCollectionFactory
 * @see DataCollection
 * @see DataModel
 */
var DataCollectionFactory = /** @class */ (function () {
    function DataCollectionFactory(externalDataCollectionFactory, backendConnector) {
        var _this = this;
        this.dataProviders = {};
        this.addQueueWorkerListener = function (queueWorkerListener) { return _this.queueWorker.addQueueWorkerListener(queueWorkerListener); };
        this.removeQueueWorkerListener = function (queueWorkerListener) { return _this.queueWorker.removeQueueWorkerListener(queueWorkerListener); };
        this.computeActualQueueStates = function () { return _this.queueWorker.computeActualQueueStates(); };
        this._externalDataCollectionFactory = externalDataCollectionFactory;
        this.queueWorker = new internal_3.QueueWorker(backendConnector);
    }
    DataCollectionFactory.prototype.buildDataProvider = function (dataProviderName, dataProviderConfigClass, dataModelClass) {
        dataProviderName = DataCollectionFactory.normalizeName(dataProviderName);
        var dataProvider = this.dataProviders[dataProviderName];
        if (!dataProvider) {
            this.dataProviders[dataProviderName] = new internal_1.DataProvider(this, new dataProviderConfigClass(dataProviderName, this.queueWorker), dataModelClass);
            dataProvider = this.dataProviders[dataProviderName];
        }
        return dataProvider;
    };
    DataCollectionFactory.prototype.createCollection = function (dataProviderName, dataProviderConfigClass, dataModelClass, options) {
        options = options || {};
        return this.buildDataProvider(dataProviderName, dataProviderConfigClass, dataModelClass).createCollection(options);
    };
    DataCollectionFactory.prototype.buildInstance = function (dataProviderName, map) {
        dataProviderName = DataCollectionFactory.normalizeName(dataProviderName);
        var dataProvider = this.dataProviders[dataProviderName];
        if (!dataProvider) {
            throw new Error("There is no such DataProvider for " + dataProviderName);
        }
        return dataProvider.createDataModel(map || {}, true);
    };
    Object.defineProperty(DataCollectionFactory.prototype, "externalDataCollectionFactory", {
        /**
         * Attribute accessor for externalDataCollectionFactory
         */
        get: function () {
            return this._externalDataCollectionFactory;
        },
        enumerable: true,
        configurable: true
    });
    DataCollectionFactory.normalizeName = function (str) {
        return internal_2.StringOperations.capitalize(internal_2.StringOperations.removeNonAlphaNumericChars(str));
    };
    return DataCollectionFactory;
}());
exports.DataCollectionFactory = DataCollectionFactory;
