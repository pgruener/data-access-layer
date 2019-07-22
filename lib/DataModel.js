"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var internal_1 = require("./internal");
var internal_2 = require("./internal");
var internal_3 = require("./internal");
var internal_4 = require("./internal");
var DataModel = /** @class */ (function () {
    function DataModel(properties, dataProvider, isNewInstance) {
        var _this = this;
        this.listeners = new Array();
        this.criticalListeners = new Array();
        this.requestQueue = [];
        this.clientChangedProperties = new internal_4.DataModelPropertySet();
        this.markedForDeletion = false;
        this.transactionRunning = false;
        this.shouldMerge = function (objectMap) {
            var updatedAtAttributeName = _this.dataProvider.config.getUpdatedAtAttributeName();
            if (!_this.hasProperty(updatedAtAttributeName)) {
                return true;
            }
            var a = new Date(_this.getProperty(updatedAtAttributeName)).getTime();
            var b = new Date(objectMap[updatedAtAttributeName].toString()).getTime();
            console.log(a + " == " + b + " ? " + (!(a > b) && !(a < b)));
            console.log(_this.changedProperties.exportAsObjectMap());
            return a < b;
        };
        this.performAction = function (action, actionVariables, payload) {
            _this.dataProvider.doRequest(new internal_2.ActionRequestData(_this.dataProvider, _this, action, actionVariables, payload));
        };
        this.properties = new internal_4.DataModelPropertySet(this.mapDataIn(properties));
        this.dataProvider = dataProvider;
        this.instanceNr = ++DataModel.INSTANCE_COUNTER;
        if (isNewInstance) {
            this.setProperty(internal_1.CLIENT_ID_ATTRIBUTE, 'model_' + Date.now());
        }
    }
    Object.defineProperty(DataModel.prototype, "dataProviderConfig", {
        get: function () {
            return this.dataProvider.config;
        },
        enumerable: true,
        configurable: true
    });
    DataModel.prototype.informAboutRequest = function (requestData) {
        this.requestQueue.push(new internal_3.DataModelRequestMetaData(requestData));
    };
    DataModel.prototype.triggerChangeListeners = function () {
        var _this = this;
        console.log('triggerChangeListeners');
        // console.log('DataModel - trigger listeners', this.instanceNr)
        this.criticalListeners.forEach(function (listener) {
            listener.dataModelChanged(_this);
        });
        window.clearTimeout(this.changeIntervalId);
        this.changeIntervalId = window.setTimeout(function () {
            _this.listeners.forEach(function (listener) {
                listener.dataModelChanged(_this);
            });
        }, this.dataProvider.config.getChangePropagateWaitDuration().milliSeconds);
    };
    DataModel.prototype.isMarkedForDeletion = function () {
        return this.markedForDeletion;
    };
    DataModel.prototype.beginTransaction = function () {
        this.transactionRunning = true;
    };
    DataModel.prototype.commitTransaction = function () {
        if (this.transactionRunning) {
            this.transactionRunning = false;
            this.triggerChangeListeners();
        }
    };
    DataModel.prototype.save = function () {
        if (!this.transactionRunning) {
            this.dataProvider.dataModelAsksForSave(this);
        }
    };
    DataModel.prototype.delete = function () {
        if (!this.markedForDeletion) {
            this.markedForDeletion = true;
        }
    };
    DataModel.prototype.addListener = function (listener, critical) {
        if (critical) {
            this.criticalListeners.push(listener);
        }
        else {
            this.listeners.push(listener);
        }
    };
    DataModel.prototype.removeListener = function (listener) {
        this.removeListenerIntern(listener, this.listeners);
        this.removeListenerIntern(listener, this.criticalListeners);
    };
    DataModel.prototype.removeListenerIntern = function (listener, list) {
        var index = list.indexOf(listener);
        if (index > -1) {
            list.splice(index, 1);
        }
    };
    DataModel.prototype.getProperty = function (propertyName, fallbackValue) {
        if (this.clientChangedProperties.hasProperty(propertyName)) {
            return this.clientChangedProperties.getValue(propertyName);
        }
        return this.properties.getValue(propertyName) || fallbackValue;
    };
    DataModel.prototype.getPropertyForFilter = function (propertyName) {
        switch (propertyName) {
            case internal_1.IDENTITY_HASH_CODE_PROPERTY_NAME:
                return this.computeIdentityHashCode();
            default:
                return this.getProperty(propertyName);
        }
    };
    DataModel.prototype.isPersisted = function () {
        var _this = this;
        var isPersisted = true;
        var identityRelevantAttributeNames = this.dataProvider.config.getIdentityRelevantAttributeNames();
        identityRelevantAttributeNames.forEach(function (attributeName) {
            isPersisted = isPersisted && _this.hasProperty(attributeName);
        });
        return isPersisted;
    };
    DataModel.prototype.removeProperty = function (propertyName) {
        this.clientChangedProperties.removeProperty(propertyName);
        this.properties.removeProperty(propertyName);
        this.triggerChangeListeners();
    };
    DataModel.prototype.resetChanges = function () {
        this.clientChangedProperties.clear();
        this.triggerChangeListeners();
    };
    DataModel.prototype.removePropertyChange = function (propertyName) {
        this.clientChangedProperties.removeProperty(propertyName);
        this.triggerChangeListeners();
    };
    DataModel.prototype.hasProperty = function (propertyName) {
        console.log(this.getProperty(propertyName), propertyName);
        return this.getProperty(propertyName) !== undefined;
    };
    DataModel.prototype.setProperty = function (propertyName, value, skipTriggerListeners) {
        if (this.isMarkedForDeletion()) {
            throw new Error("You tried to set a property '" + propertyName + "' of a datModel " + this + " which is already marked for deletion. This is inappropriate.");
        }
        var changed = !this.properties.hasProperty(propertyName, value) || !this.clientChangedProperties.hasProperty(propertyName, value);
        if (changed) {
            this.clientChangedProperties.set(propertyName, value);
            if (!skipTriggerListeners) {
                this.triggerChangeListeners();
            }
        }
        return changed;
    };
    DataModel.prototype.setProperties = function (map, shouldClearProperties) {
        if (shouldClearProperties) {
            this.properties.clear();
        }
        var anythingChanged = false;
        for (var key in map) {
            anythingChanged = this.setProperty(key, map[key], true) || anythingChanged;
        }
        if (anythingChanged) {
            this.triggerChangeListeners();
        }
    };
    Object.defineProperty(DataModel.prototype, "originalProperties", {
        get: function () {
            return this.properties;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataModel.prototype, "changedProperties", {
        get: function () {
            return this.clientChangedProperties;
        },
        enumerable: true,
        configurable: true
    });
    DataModel.prototype.mapDataIn = function (/*requestData:DataModelRequestData<DataModel>, */ objectMap) {
        return objectMap;
    };
    DataModel.prototype.mapDataOut = function (requestData) {
        return requestData.dataForRequest;
    };
    DataModel.prototype.hasChanges = function () {
        return Object.keys(this.changedProperties).length > 0;
    };
    DataModel.prototype.hasConflict = function () {
        return this.conflictingModel != undefined;
    };
    DataModel.prototype.setConflict = function (conflictingModel) {
        this.conflictingModel = conflictingModel;
    };
    DataModel.prototype.mergeModel = function (dataModel) {
        var updatedAtProperty = this.dataProvider.config.getUpdatedAtAttributeName();
        if (new Date(this.getProperty(updatedAtProperty)) < new Date(dataModel.getProperty(updatedAtProperty))) {
            if (this.hasChanges()) {
                this.setConflict(dataModel);
            }
            else {
                this.setProperties(dataModel.properties.exportAsObjectMap(), true);
            }
        }
    };
    DataModel.prototype.mergeChanges = function (objectMap) {
        var _this = this;
        objectMap = this.mapDataIn(objectMap);
        var anythingChanged = false;
        var shouldMerge = this.shouldMerge(objectMap);
        if (shouldMerge) {
            Object.keys(objectMap).forEach(function (propertyName) {
                if (!_this.properties.hasProperty(propertyName, objectMap[propertyName])) {
                    _this.clientChangedProperties.removeProperty(propertyName);
                    _this.properties.set(propertyName, objectMap[propertyName]);
                    anythingChanged = true;
                }
            });
        }
        if (anythingChanged) {
            this.triggerChangeListeners();
        }
    };
    /**
     * Returns this models identityHashCode
     * @method computeIdentityHashCode
     * @return {string} identityHashCode
     * @see {DataModel.computeIdentityHashCode}
     */
    DataModel.prototype.computeIdentityHashCode = function () {
        return DataModel.computeIdentityHashCode(this, this.dataProvider.config);
    };
    /**
     * Computes the identityHashCode for the given dataModel or object.
     * The identiyHashCode identifies one DataModel bijectivly.
     *
     * An identiy hash code is prefixed by its model name and its contains its
     * identity relevant attributes seperated by underscore. (i.e.: milestone_5)
     *
     * @method computeIdentityHashCode
     * @static
     * @param {DataModel} dataModel
     * @param {DataProviderConfig} dataProviderConfig
     * @return {string} identityHashCode
     * @see {DataProviderConfig.getIdentityRelevantAttributeNames}
     */
    DataModel.computeIdentityHashCode = function (dataModel, dataProviderConfig) {
        var identityHashCode = dataProviderConfig.dataProviderName + '_';
        var attributeNames = dataProviderConfig.getIdentityRelevantAttributeNames();
        attributeNames.push(internal_1.CLIENT_ID_ATTRIBUTE);
        attributeNames.forEach(function (attributeName, index) {
            if (index != 0) {
                identityHashCode += '_';
            }
            if (dataModel instanceof DataModel) {
                identityHashCode += dataModel.getProperty(attributeName);
            }
            else {
                identityHashCode += dataModel[attributeName];
            }
        });
        return identityHashCode;
    };
    DataModel.INSTANCE_COUNTER = 0;
    return DataModel;
}());
exports.DataModel = DataModel;
