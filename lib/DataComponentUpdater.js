"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * DataComponentUpdater registers as listener for models and collections added.
 * It also handles deregistration by easily call destroy-method.
 *
 * The change handling must be implemented in concrete subclasses, as in our provided RXComponentUpdater.
 *
 * @abstract
 * @class DataComponentUpdater
 */
var DataComponentUpdater = /** @class */ (function () {
    function DataComponentUpdater(collections) {
        var _this = this;
        this.collections = [];
        this.dataModels = [];
        if (collections) {
            if (collections instanceof Array) {
                collections.forEach(function (collection) {
                    _this.addCollection(collection);
                });
            }
            else {
                this.addCollection(collections);
            }
        }
    }
    DataComponentUpdater.prototype.addCollection = function (collection) {
        collection.addChangeListener(this);
        this.collections.push(collection);
    };
    DataComponentUpdater.prototype.addDataModel = function (dataModel) {
        dataModel.addListener(this, true);
        this.dataModels.push(dataModel);
    };
    DataComponentUpdater.prototype.destroy = function () {
        var _this = this;
        this.collections.forEach(function (collection) {
            collection.removeChangeListener(_this);
        });
        this.collections.slice(0, 0);
        this.dataModels.forEach(function (dataModel) {
            dataModel.removeListener(_this);
        });
        this.dataModels.slice(0, 0);
    };
    return DataComponentUpdater;
}());
exports.DataComponentUpdater = DataComponentUpdater;
