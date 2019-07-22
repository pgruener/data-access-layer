"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FilterCollection_1 = require("./filter/FilterCollection");
/**
 * @class DataCollection
 * A DataCollection holds and manages a collection of DataModel instances.
 */
var DataCollection = /** @class */ (function () {
    function DataCollection(config) {
        var _this = this;
        // All entities retreived from the parent collection or data provider
        this.allEntities = new Array();
        // Remaining entities, after applying filters
        this.filteredEntities = new Array();
        this.changeListeners = new Array();
        this.filtersChanged = function () {
            _this.dataProvider.filtersChanged(_this.scopeName, _this);
            return _this.applyFilters('normal');
        };
        this._instanceNr = ++DataCollection.INSTANCE_COUNTER;
        this.scopeName = config.scope;
        this.dataProvider = config.dataProvider;
        this.changeProvider = config.changeProvider;
        this._sorting = config.sorting;
        config.changeProvider.addChangeListener(this);
        if (config.changeListener) {
            this.addChangeListener(config.changeListener);
        }
        this._topCollection = (config.topCollection == null) ? this : config.topCollection;
        this._filters = new FilterCollection_1.FilterCollection(this, config.filter);
        this.storeEntitiesAndApplyFilters(config.initialEntities);
    }
    DataCollection.prototype.setSorting = function (_sorting, once) {
        if (_sorting != this._sorting) {
            this.filteredEntities = this.sort(this.filteredEntities, _sorting);
            if (once) {
                this._sorting = undefined;
            }
            else {
                this._sorting = _sorting;
            }
        }
    };
    DataCollection.prototype.sort = function (entities, sorting) {
        if (typeof sorting == 'string') {
            return entities.sort(function (t1, t2) {
                var x = t1.getPropertyForFilter(sorting.toString());
                var y = t2.getPropertyForFilter(sorting.toString());
                return x - y;
            });
        }
        else if (sorting instanceof Function) {
            return entities.sort(sorting);
        }
        else {
            return entities.slice(0);
        }
    };
    Object.defineProperty(DataCollection.prototype, "topCollection", {
        /**
         * Attribute accessor for the collections topCollection
         */
        get: function () {
            return this._topCollection;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataCollection.prototype, "filterCollection", {
        /**
         * Attribute accessor for the collections filterCollection
         */
        get: function () {
            return this._filters;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Stores the entities retreived and applies filters to it.
     *
     * @method storeEntitiesAndApplyFilters
     * @param {DataModel[]} entities collection retreived from data provider
     * @param {boolean} [forceTriggerChildren]
     */
    DataCollection.prototype.storeEntitiesAndApplyFilters = function (entities, forceTriggerChildren) {
        this.allEntities = entities || new Array();
        this.applyFilters(forceTriggerChildren ? 'force' : 'normal');
    };
    DataCollection.prototype.dataCollectionChanged = function (dataCollection, forceTriggerChildren) {
        this.storeEntitiesAndApplyFilters(dataCollection.filteredEntities, forceTriggerChildren);
    };
    DataCollection.prototype.find = function (searchMap) {
        var entity = null;
        var mapAsMap = searchMap;
        this.filteredEntities.some(function (currentEntity) {
            var shouldUseEntity = true;
            if (typeof searchMap == 'string') {
                shouldUseEntity = currentEntity.computeIdentityHashCode() == searchMap;
            }
            else {
                Object.keys(searchMap).some(function (key) {
                    shouldUseEntity = shouldUseEntity && (currentEntity.getPropertyForFilter(key) == mapAsMap[key]);
                    return !shouldUseEntity;
                });
            }
            if (shouldUseEntity) {
                entity = currentEntity;
                return true;
            }
            return false;
        });
        return entity;
    };
    DataCollection.prototype.applyFilters = function (applyFilterMode) {
        var filteredEntities = this._filters.run(this.allEntities);
        var somethingChanged = applyFilterMode == 'force' || this.filteredEntitiesChanged(filteredEntities);
        this.filteredEntities = this.sort(filteredEntities, this._sorting);
        if (somethingChanged && applyFilterMode != 'skip') {
            this.triggerListeners();
        }
        return somethingChanged;
    };
    DataCollection.prototype.filteredEntitiesChanged = function (newFilteredEntities) {
        if (this.filteredEntities.length != newFilteredEntities.length) {
            return true;
        }
        var lookupMap = {};
        this.filteredEntities.forEach(function (dataModel) {
            lookupMap[dataModel.computeIdentityHashCode()] = false;
        });
        var entitiesChanged = false;
        newFilteredEntities.some(function (dataModel) {
            var identiyHashCode = dataModel.computeIdentityHashCode();
            if (lookupMap.hasOwnProperty(identiyHashCode)) {
                delete lookupMap[identiyHashCode];
                return false;
            }
            else {
                entitiesChanged = true;
                return true;
            }
        });
        return entitiesChanged;
    };
    Object.defineProperty(DataCollection.prototype, "instanceNr", {
        /**
         * Attribute accessor for instanceNr
         */
        get: function () {
            return this._instanceNr;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Retreives entities - sorted, if desired
     * @param {string|{ (t1:T, t2:T):number}} [sorting] property to sort or sorting method
     * @return {T[]} entities
     */
    DataCollection.prototype.getEntities = function (sorting) {
        if (sorting != undefined) {
            return this.sort(this.filteredEntities, sorting);
        }
        else {
            return this.filteredEntities.slice(0);
        }
    };
    /**
     * Informs, if the collection is empty.
     * @method isEmpty
     * @return {boolean} <code>true</code> if no entity available, <code>false</code> otherwise.
     */
    DataCollection.prototype.isEmpty = function () {
        return this.filteredEntities.length === 0;
    };
    /**
     * Returns the first entity in the collection
     * @method getFirstEntity
     * @return {T} entity or null
     */
    DataCollection.prototype.getFirstEntity = function () {
        if (this.isEmpty()) {
            return null;
        }
        return this.filteredEntities[0];
    };
    /**
     * Returns the last entity in the collection
     * @method getLastEntity
     * @return {T} entity or null
     */
    DataCollection.prototype.getLastEntity = function () {
        if (this.isEmpty()) {
            return null;
        }
        return this.filteredEntities[this.filteredEntities.length - 1];
    };
    /**
     * Creates an exact same copy to this DataCollection
     * @method createCopy
     * @return {DataCollection<T>}
     */
    DataCollection.prototype.createCopy = function () {
        return new DataCollection({ dataProvider: this.dataProvider, changeProvider: this.changeProvider, initialEntities: this.allEntities, filter: this.filterCollection.filterRules, scope: this.scopeName, topCollection: this.topCollection });
    };
    /**
     * Creates a sub collection with filters given
     * @method createSubCollection
     * @param {FilterRule<Object>|FilterRule<Object>[]} filter
     * @return {DataCollection<T>}
     */
    DataCollection.prototype.createSubCollection = function (filter) {
        return new DataCollection({ dataProvider: this.dataProvider, changeProvider: this, initialEntities: this.filteredEntities, filter: filter, scope: this.scopeName, topCollection: this.topCollection });
    };
    DataCollection.prototype.triggerListeners = function (forceTriggerChildren) {
        var _this = this;
        this.changeListeners.forEach(function (listener) {
            listener.dataCollectionChanged(_this, forceTriggerChildren);
        });
    };
    DataCollection.prototype.addChangeListener = function (listener) {
        this.changeListeners.push(listener);
    };
    DataCollection.prototype.removeChangeListener = function (listener) {
        var index = this.changeListeners.indexOf(listener);
        if (index > -1) {
            this.changeListeners.splice(index, 1);
        }
    };
    DataCollection.INSTANCE_COUNTER = 0;
    return DataCollection;
}());
exports.DataCollection = DataCollection;
