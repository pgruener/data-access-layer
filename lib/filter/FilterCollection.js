"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A FilterCollection is connected to an instance of a {@link DataCollection}. It holds all {@link FilterRule|FilterRules}
 * instances, that are used to filter the DataCollection.
 *
 * By default it just removes objects from the DataCollection, that are marked for deletion.
 *
 * @class FilterCollection
 */
var FilterCollection = /** @class */ (function () {
    function FilterCollection(ownerCollection, filter) {
        this._filterRules = new Array();
        this.ownerCollection = ownerCollection;
        this.add(filter, true);
    }
    /**
     * Triggers filtersChanged on listener, if optional skip parameter is not set to true.
     *
     * @private
     * @method triggerListener
     * @param {boolean} [shouldSkipChangeListener]
     * @returns {boolean} <code>true</code>, if something changed, <code>false</code> otherwise.
     */
    FilterCollection.prototype.triggerListener = function (shouldSkipChangeListener) {
        if (!shouldSkipChangeListener) {
            return this.ownerCollection.filtersChanged();
        }
        return false;
    };
    /**
     * Adds a {@link FilterRule} or an array of FilterRule to the {@link FilterCollection}.
     * This automatically triggers the {@link DataCollection|DataCollections} recalculation of
     * elements, if shouldSkipChangeListener is false (default behavior)
     *
     * @method add
     * @param {FilterRule<T>|FilterRule<T>[]} filter to be added
     * @param {boolean} [shouldSkipChangeListener]
     */
    FilterCollection.prototype.add = function (filter, shouldSkipChangeListener) {
        if (filter === undefined) {
            return false;
        }
        this._filterRules = this._filterRules.concat(filter);
        return this.triggerListener(shouldSkipChangeListener);
    };
    /**
     * Removes a {@link FilterRule} or an array of FilterRules from the FilterCollection.
     * Returns <code>true</code>, if the removal changed the filteredEntities of connected collections.
     *
     * @method remove
     * @param {FilterRule<T>|FilterRule<T>[]} filter to remove
     * @returns {boolean} somethingChanged
     */
    FilterCollection.prototype.remove = function (filter) {
        var _this = this;
        if (filter instanceof Array) {
            filter.forEach(function (currentFilter) {
                _this.removeIntern(currentFilter);
            });
        }
        else {
            this.removeIntern(filter);
        }
        return this.triggerListener();
    };
    /**
     * Removes the given FilterRule from the FilterCollection.
     *
     * @private
     * @method removeIntern
     * @param {FilterRule} filterRule
     */
    FilterCollection.prototype.removeIntern = function (filterRule) {
        var index = this._filterRules.indexOf(filterRule);
        if (index !== -1) {
            this._filterRules.splice(index, 1);
        }
    };
    /**
     * Clears collection and sets the given {@link FilterRule} or array of FilterRules as new filters.
     *
     * @method set
     * @param {FilterRule} filter
     * @returns {boolean} somethingChanged
     */
    FilterCollection.prototype.set = function (filter) {
        this.clear(true);
        return this.add(filter);
    };
    /**
     * Clears the collection.
     *
     * @method clear
     * @param {boolean} [shouldSkipChangeListener]
     * @returns {boolean} somethingChanged
     */
    FilterCollection.prototype.clear = function (shouldSkipChangeListener) {
        this._filterRules.length = 0;
        return this.triggerListener(shouldSkipChangeListener);
    };
    /**
     * Applies all filterRules to the entities and returns filtered list of entities.
     * @method run
     * @param {T[]} allEntities
     * @returns {T[]} filteredEntities
     */
    FilterCollection.prototype.run = function (allEntities) {
        var filteredEntities = allEntities.slice(0);
        // Attention
        // The idea of tweaking the performance by reordering the filterRules
        // may not give correct results, since some FilterRules depend on the order (i.e. FilterRuleMax).
        // Before implementing, we would have to prove, that our result is deterministically the same.
        this._filterRules.forEach(function (filterRule) {
            filteredEntities = filterRule.filter(filteredEntities);
        });
        return this.removeEntitiesMarkedForDeletion(filteredEntities);
    };
    /**
     * Filters entities to not contain ones that are marked for deletion.
     *
     * @private
     * @method removeEntitiesMarkedForDeletion
     * @param {T[]} entities
     * @returns {T[]}
     */
    FilterCollection.prototype.removeEntitiesMarkedForDeletion = function (entities) {
        return entities.filter(function (entity) {
            return !entity.isMarkedForDeletion();
        });
    };
    Object.defineProperty(FilterCollection.prototype, "filterRules", {
        /**
         * Attribute accessor for filterRules
         */
        get: function () {
            return this._filterRules;
        },
        enumerable: true,
        configurable: true
    });
    return FilterCollection;
}());
exports.FilterCollection = FilterCollection;
