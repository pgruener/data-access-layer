"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var internal_1 = require("./internal");
var DataModelPropertySet = /** @class */ (function () {
    function DataModelPropertySet(objectMap) {
        var _this = this;
        this.properties = {};
        if (objectMap) {
            Object.keys(objectMap).forEach(function (propertyName) {
                _this.set(propertyName, objectMap[propertyName]);
            });
        }
    }
    DataModelPropertySet.prototype.getAllPropertieNames = function () {
        return Object.keys(this.properties);
    };
    DataModelPropertySet.prototype.hasProperty = function (propertyName, value) {
        var hasProperty = this.properties.hasOwnProperty(propertyName);
        if (hasProperty && value) {
            return this.getValue(propertyName) === value;
        }
        else {
            return hasProperty;
        }
    };
    DataModelPropertySet.prototype.getValue = function (propertyName) {
        if (this.properties[propertyName] && this.properties[propertyName].value) {
            return this.properties[propertyName].value;
        }
        else {
            return undefined;
        }
        // return this.properties[propertyName].value as T
    };
    DataModelPropertySet.prototype.getMetaDates = function (propertyName) {
        return this.properties[propertyName].metaDates;
    };
    DataModelPropertySet.prototype.clear = function () {
        this.properties = {};
    };
    DataModelPropertySet.prototype.removeProperty = function (propertyName) {
        delete this.properties[propertyName];
    };
    DataModelPropertySet.prototype.set = function (propertyName, value) {
        if (this.hasProperty(propertyName)) {
            this.properties[propertyName].setValue(value);
        }
        else {
            this.properties[propertyName] = new internal_1.DataModelProperty(value);
        }
    };
    DataModelPropertySet.prototype.exportAsObjectMap = function () {
        var _this = this;
        var map = {};
        Object.keys(this.properties).forEach(function (propertyName) {
            var property = _this.properties[propertyName];
            if (property.shouldExport()) {
                map[propertyName] = property.exportValue();
            }
        });
        return map;
    };
    DataModelPropertySet.prototype.hasChangesSinceLastExport = function () {
        var _this = this;
        return Object.keys(this.properties).filter(function (propertyName) {
            return _this.properties[propertyName].shouldExport();
        }).length != 0;
    };
    DataModelPropertySet.prototype.asObjectMap = function () {
        var _this = this;
        var map = {};
        Object.keys(this.properties).forEach(function (propertyName) {
            map[propertyName] = _this.properties[propertyName].value;
        });
        return map;
    };
    DataModelPropertySet.prototype.unmodifiableClone = function () {
        return new internal_1.UnmodifiableDataModelPropertySet(this);
    };
    return DataModelPropertySet;
}());
exports.DataModelPropertySet = DataModelPropertySet;
