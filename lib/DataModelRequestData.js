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
 * @class DataModelRequestData
 * @extends RequestData
 */
var DataModelRequestData = /** @class */ (function (_super) {
    __extends(DataModelRequestData, _super);
    function DataModelRequestData(dataProvider, dataModel, action) {
        var _this = _super.call(this, dataProvider) || this;
        _this._dataModel = dataModel;
        _this._propertiesSnapshot = dataModel.originalProperties.unmodifiableClone();
        _this._dataForRequest = dataModel.changedProperties.asObjectMap();
        _this._dataForRequest = dataModel.dataProviderConfig.prepareForServer(_this);
        _this._changedPropertiesSnapshot = dataModel.changedProperties.unmodifiableClone(); // Must be done AFTER prepared for server
        _this.action = action;
        _this._actionUrl = _this._dataModel.dataProviderConfig.getActionUrlSet().computeActionUrl(_this.action, _this._dataModel);
        _this._payload = _this._dataModel.dataProviderConfig.computePayloadForRequest(_this);
        return _this;
    }
    Object.defineProperty(DataModelRequestData.prototype, "dataForRequest", {
        get: function () {
            return this._dataForRequest;
        },
        enumerable: true,
        configurable: true
    });
    DataModelRequestData.prototype.handleResponse = function (response) {
        _super.prototype.handleResponse.call(this, response);
        if (this.action == 'create') {
            this._dataProvider.onAfterNewInstance(this);
        }
        else if (this.action == 'delete') {
            // Fix a bug who didn't really delete a data modell when you wanted to delete it
        }
        else {
            this._dataProvider.onAfterUpdate(this);
        }
    };
    Object.defineProperty(DataModelRequestData.prototype, "propertiesSnapshot", {
        /**
         * Attribute accessor for propertiesSnapshot
         */
        get: function () {
            return this._propertiesSnapshot;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataModelRequestData.prototype, "changedPropertiesSnapshot", {
        /**
         * Attribute accessor for changedPropertiesSnapshot
         */
        get: function () {
            return this._changedPropertiesSnapshot;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataModelRequestData.prototype, "dataModel", {
        /**
         * Attribute accessor for dataModel
         */
        get: function () {
            return this._dataModel;
        },
        enumerable: true,
        configurable: true
    });
    return DataModelRequestData;
}(internal_1.RequestData));
exports.DataModelRequestData = DataModelRequestData;
