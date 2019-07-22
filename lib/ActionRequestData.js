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
/**
 * @class ActionRequestData
 * @extends DataModelRequestData
 */
var ActionRequestData = /** @class */ (function (_super) {
    __extends(ActionRequestData, _super);
    function ActionRequestData(dataProvider, dataModel, action, parameters, payload) {
        var _this = _super.call(this, dataProvider, dataModel, action) || this;
        _this._actionUrl = dataModel.dataProviderConfig.getActionUrlSet().computeActionUrl(_this.action, dataModel, parameters);
        _this._payload = payload;
        return _this;
    }
    return ActionRequestData;
}(internal_1.DataModelRequestData));
exports.ActionRequestData = ActionRequestData;
