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
var internal_1 = require("./internal");
var UnmodifiableDataModelPropertySet = /** @class */ (function (_super) {
    __extends(UnmodifiableDataModelPropertySet, _super);
    function UnmodifiableDataModelPropertySet(dataModelPropertySet) {
        var _this = _super.call(this) || this;
        dataModelPropertySet.getAllPropertieNames().forEach(function (propertyName) {
            _this.properties[propertyName] = new internal_1.UnmodifiableDataModelProperty(dataModelPropertySet.getValue(propertyName), dataModelPropertySet.getMetaDates(propertyName));
        });
        return _this;
    }
    UnmodifiableDataModelPropertySet.prototype.clear = function () {
        throw new internal_1.ClassUnmodifiableError('Cannot clear unmodifiable class.');
    };
    UnmodifiableDataModelPropertySet.prototype.removeProperty = function (propertyName) {
        throw new internal_1.ClassUnmodifiableError('Cannot remove property in unmodifiable class.');
    };
    UnmodifiableDataModelPropertySet.prototype.set = function (propertyName, value) {
        throw new internal_1.ClassUnmodifiableError('Cannot set value in unmodifiable class.');
    };
    UnmodifiableDataModelPropertySet.prototype.exportAsObjectMap = function () {
        return null;
    };
    return UnmodifiableDataModelPropertySet;
}(internal_1.DataModelPropertySet));
exports.UnmodifiableDataModelPropertySet = UnmodifiableDataModelPropertySet;
