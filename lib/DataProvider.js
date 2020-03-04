"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var internal_1 = require("./internal");
var internal_2 = require("./internal");
var internal_3 = require("./internal");
var internal_4 = require("./internal");
var internal_5 = require("./internal");
var DataProvider = /** @class */ (function () {
    function DataProvider(dataCollectionFactory, config, dataModelClass) {
        var _this = this;
        this._state = 'not_inited';
        this.rootDataCollectionsByScope = {};
        this._allEntities = {};
        this.changeListeners = new Array();
        this.requestCacheTimeouts = {};
        this.onAfterNewInstance = function (dataModelRequestData) {
            var dataModel = dataModelRequestData.dataModel;
            var objectMaps = dataModelRequestData.response;
            dataModel.mergeChanges(objectMaps);
            delete _this._allEntities[dataModel.computeIdentityHashCode(true)];
            dataModel.removeProperty(internal_3.CLIENT_ID_ATTRIBUTE);
            _this._allEntities[dataModel.computeIdentityHashCode()] = dataModel;
        };
        this.onAfterUpdate = function (dataModelRequestData) {
            var objectMaps = dataModelRequestData.response;
            if (objectMaps.constructor == Array) {
                objectMaps.forEach(function (objectMap) {
                    _this.createDataModel(objectMap);
                });
            }
            else {
                _this.createDataModel(objectMaps);
            }
        };
        this.dataCollectionFactory = dataCollectionFactory;
        this._config = config;
        this.dataModelClass = dataModelClass;
    }
    Object.defineProperty(DataProvider.prototype, "config", {
        /**
         * Attribute accessor to retreive {@link DataProviderConfig}
         */
        get: function () {
            return this._config;
        },
        enumerable: true,
        configurable: true
    });
    DataProvider.prototype.dataCollectionChanged = function (dataCollection) {
        this.changeListeners.forEach(function (listener) {
            listener.dataCollectionChanged(dataCollection);
        });
    };
    Object.defineProperty(DataProvider.prototype, "state", {
        get: function () {
            return this._state;
        },
        enumerable: true,
        configurable: true
    });
    DataProvider.prototype.addChangeListener = function (listener) {
        this.changeListeners.push(listener);
    };
    DataProvider.prototype.removeChangeListener = function (listener) {
        var index = this.changeListeners.indexOf(listener);
        if (index > -1) {
            this.changeListeners.splice(index, 1);
        }
    };
    DataProvider.prototype.loadData = function (scopeName, collection) {
        var _this = this;
        if (this.config.hasUrl(scopeName)) {
            var initialEntities = this.config.getInitialEntities(scopeName);
            if (initialEntities) {
                initialEntities.forEach(function (objectMap) {
                    _this.createDataModel(objectMap);
                });
                // TODO: Wie kriegen diese initialen Einträge aus dem JSON die Verbindung zu einem Scope?
            }
            var url = this.config.computeSelectionUrl(scopeName, collection);
            if (this.shouldLoadData(url, collection)) {
                this.requestCacheTimeouts[url] = Date.now() + this.config.getDataCacheLifetime().milliSeconds;
                this.config.queueWorker.doRequest(new internal_5.UrlRequestData(this, url, scopeName));
            }
        }
    };
    DataProvider.prototype.onLoadedData = function (urlRequestData) {
        var _this = this;
        var objectMaps = urlRequestData.response;
        if (objectMaps) {
            var entities_1 = new Array();
            objectMaps.forEach(function (objectMap) {
                entities_1.push(_this.createDataModel(objectMap));
            });
            this.buildRootDataCollection(urlRequestData.scopeName).mergeEntities(entities_1);
        }
    };
    DataProvider.prototype.shouldLoadData = function (url, selectionTriggerCollection) {
        if (url == null) {
            return false;
        }
        var timeout = this.requestCacheTimeouts[url];
        if (!timeout) {
            return true;
        }
        return Date.now() > timeout;
    };
    DataProvider.prototype.onBeforeDelete = function (dataModel) {
        this.deleteIntern(dataModel.computeIdentityHashCode());
    };
    DataProvider.prototype.onAfterDelete = function (dataModel) {
        this.deleteIntern(dataModel.computeIdentityHashCode());
    };
    DataProvider.prototype.deleteIntern = function (identityHashCode) {
        var _this = this;
        if (this._allEntities[identityHashCode]) {
            delete this._allEntities[identityHashCode];
            Object.keys(this.rootDataCollectionsByScope).forEach(function (key) {
                // FIXME: This MUST be done by using remove instead writing ALL entities to every scope
                _this.rootDataCollectionsByScope[key].setEntities(_this.allEntities);
            });
        }
    };
    Object.defineProperty(DataProvider.prototype, "allEntities", {
        get: function () {
            var _this = this;
            var dataModels = [];
            Object.keys(this._allEntities).forEach(function (key) {
                dataModels.push(_this._allEntities[key]);
            });
            return dataModels;
        },
        enumerable: true,
        configurable: true
    });
    DataProvider.prototype.find = function (dataProviderName, searchMap) {
        return this.dataCollectionFactory.externalDataCollectionFactory.find(dataProviderName, searchMap);
    };
    DataProvider.prototype.doRequest = function (requestData) {
        var queueName = this.config.getBackendConnectorQueueName();
        this.config.queueWorker.doRequest(requestData, queueName);
    };
    DataProvider.prototype.createDataModel = function (objectMap, isBuild) {
        var _this = this;
        var identityHashCode = this.dataModelClass.computeIdentityHashCode(objectMap, this.config);
        var dataModel = this._allEntities[identityHashCode];
        if (!dataModel) {
            dataModel = new this.dataModelClass(objectMap, this, isBuild);
            identityHashCode = dataModel.computeIdentityHashCode();
            this._allEntities[identityHashCode] = dataModel;
            if (isBuild) {
                this.config.getNewInstanceDataModelScopeNames().forEach(function (scopeName) {
                    _this.buildRootDataCollection(scopeName).addDataModel(dataModel);
                });
            }
        }
        else {
            if (!this.config.shouldSurpressIdentityHashCodeWarning() && identityHashCode == this.dataModelClass.computeIdentityHashCode({}, this.config)) {
                console.warn("It seems like you forgot implement getIdentityRelevantAttributeNames correctly for " + this.config.dataProviderName + ", but received " + dataModel + " in your DataProviderConfig subclass.");
            }
            dataModel.mergeChanges(objectMap);
        }
        return dataModel;
    };
    // Changed private to public to use computeRequestVerb also later
    DataProvider.prototype.computeRequestVerb = function (dataModel) {
        if (dataModel.isMarkedForDeletion()) {
            return 'delete';
        }
        else if (dataModel.hasProperty(internal_3.CLIENT_ID_ATTRIBUTE)) {
            if (dataModel.setCreationScheduled()) {
                return 'create';
            }
            else {
                return 'update';
            }
        }
        else {
            return 'update';
        }
    };
    DataProvider.prototype.dataModelAsksForSave = function (dataModel) {
        var requestVerb = this.computeRequestVerb(dataModel);
        if (requestVerb == 'delete') {
            this.onBeforeDelete(dataModel);
        }
        else {
            if (!dataModel.changedProperties.hasChangesSinceLastExport()) {
                // Dont do any request, if there is nothing to export.
                return;
            }
        }
        this.doRequest(new internal_4.DataModelRequestData(this, dataModel, requestVerb));
    };
    DataProvider.prototype.buildRootDataCollection = function (scopeName) {
        scopeName = scopeName || internal_3.DEFAULT_SCOPE_NAME;
        if (!this.hasRootDataCollection(scopeName)) {
            this.rootDataCollectionsByScope[scopeName] = new internal_2.RootDataCollection({ dataProvider: this, changeProvider: this, scope: scopeName, topCollection: null });
        }
        return this.rootDataCollectionsByScope[scopeName];
    };
    DataProvider.prototype.hasRootDataCollection = function (scopeName) {
        return this.rootDataCollectionsByScope.hasOwnProperty(scopeName);
    };
    DataProvider.prototype.createCollection = function (options) {
        if (!options.scope) {
            options.scope = internal_3.DEFAULT_SCOPE_NAME;
        }
        var shouldLoad = (this.config.getInitialRequestMoment() == 'on_first_collection') && !this.hasRootDataCollection(options.scope);
        var rootDataCollection = this.buildRootDataCollection(options.scope);
        var dataCollection = new internal_1.DataCollection({
            dataProvider: this,
            changeProvider: rootDataCollection,
            scope: options.scope,
            initialEntities: rootDataCollection.getEntities(),
            changeListener: options.dataCollectionChangeListener,
            topCollection: null
        });
        if (shouldLoad) {
            this.loadData(options.scope);
        }
        return dataCollection;
    };
    DataProvider.prototype.filtersChanged = function (scope, collection) {
        this.loadData(scope, collection);
    };
    return DataProvider;
}());
exports.DataProvider = DataProvider;
