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
exports.RootDataCollection = void 0;
var DataCollection_1 = require("./DataCollection");
/**
 * The RootDataCollection holds all known data for one specific {@link DataModel|DataModel type}.
 * It manages adding, deleting and merging DataModels.
 *
 * @class RootDataCollection
 * @extends DataCollection
 */
var RootDataCollection = /** @class */ (function (_super) {
    __extends(RootDataCollection, _super);
    function RootDataCollection() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RootDataCollection.prototype.addDataModel = function (dataModel) {
        if (this.allEntities.indexOf(dataModel) === -1) {
            this.allEntities.push(dataModel);
            dataModel.addListener(this);
            this.storeEntitiesAndApplyFilters(this.allEntities);
        }
    };
    RootDataCollection.prototype.mergeEntities = function (newEntities) {
        var _this = this;
        var map = {};
        this.allEntities.forEach(function (entity) {
            map[entity.computeIdentityHashCode()] = entity;
        });
        newEntities.forEach(function (entity) {
            var availableEntity = map[entity.computeIdentityHashCode()];
            if (availableEntity) {
                availableEntity.mergeModel(entity);
            }
            else {
                entity.addListener(_this);
                _this.allEntities = _this.allEntities.concat(entity);
            }
        });
        this.storeEntitiesAndApplyFilters(this.allEntities);
    };
    RootDataCollection.prototype.setEntities = function (entities) {
        var _this = this;
        this.allEntities.forEach(function (entity) {
            entity.removeListener(_this);
        });
        entities.forEach(function (entity) {
            entity.addListener(_this);
        });
        this.storeEntitiesAndApplyFilters(entities);
    };
    RootDataCollection.prototype.dataModelChanged = function (dataModel) {
        if (this.allEntities.indexOf(dataModel) !== -1) {
            this.triggerListeners(true);
        }
    };
    return RootDataCollection;
}(DataCollection_1.DataCollection));
exports.RootDataCollection = RootDataCollection;
