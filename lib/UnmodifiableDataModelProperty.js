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
exports.UnmodifiableDataModelProperty = void 0;
var internal_1 = require("./internal");
var UnmodifiableDataModelProperty = /** @class */ (function (_super) {
    __extends(UnmodifiableDataModelProperty, _super);
    function UnmodifiableDataModelProperty(value, propertyMetaDates) {
        var _this = _super.call(this, value) || this;
        _this.propertyMetaDates = propertyMetaDates;
        return _this;
    }
    UnmodifiableDataModelProperty.prototype.setMetaDate = function (dataModelPropertyMetaDate, date) {
        throw new internal_1.ClassUnmodifiableError('Setting meta dates is not allowed in unmodifiable class.');
    };
    return UnmodifiableDataModelProperty;
}(internal_1.DataModelProperty));
exports.UnmodifiableDataModelProperty = UnmodifiableDataModelProperty;
