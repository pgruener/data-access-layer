"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataModelProperty = void 0;
var DataModelProperty = /** @class */ (function () {
    function DataModelProperty(value) {
        this.propertyMetaDates = {};
        this._value = value;
        this.setMetaDateIntern('created');
        this.setMetaDateIntern('last_change');
        this.setMetaDateIntern('last_export', new Date(0));
    }
    DataModelProperty.prototype.setValue = function (newValue) {
        this._value = newValue;
        this.setMetaDateIntern('last_change');
    };
    Object.defineProperty(DataModelProperty.prototype, "metaDates", {
        get: function () {
            return this.propertyMetaDates;
        },
        enumerable: false,
        configurable: true
    });
    DataModelProperty.prototype.setMetaDate = function (dataModelPropertyMetaDate, date) {
        this.setMetaDateIntern(dataModelPropertyMetaDate, date);
    };
    DataModelProperty.prototype.setMetaDateIntern = function (dataModelPropertyMetaDate, date) {
        this.propertyMetaDates[dataModelPropertyMetaDate] = date || new Date();
    };
    DataModelProperty.prototype.getMetaDate = function (dataModelPropertyMetaDate) {
        return this.propertyMetaDates[dataModelPropertyMetaDate] || null;
    };
    DataModelProperty.prototype.exportValue = function () {
        this.setMetaDateIntern('last_export');
        return this.value;
    };
    DataModelProperty.prototype.shouldExport = function () {
        return this.getMetaDate('last_change') > this.getMetaDate('last_export');
    };
    Object.defineProperty(DataModelProperty.prototype, "value", {
        get: function () {
            this.setMetaDateIntern('returned_value');
            return this._value;
        },
        enumerable: false,
        configurable: true
    });
    return DataModelProperty;
}());
exports.DataModelProperty = DataModelProperty;
