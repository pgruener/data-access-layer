"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataProviderConfig = void 0;
var internal_1 = require("./internal");
var internal_2 = require("./internal");
var internal_3 = require("./internal");
var FilterMarking_1 = require("./filter/FilterMarking");
var NotEnoughFiltersError_1 = require("./filter/NotEnoughFiltersError");
var TooManyFiltersError_1 = require("./filter/TooManyFiltersError");
var FilterRuleIn_1 = require("./filter/FilterRuleIn");
var DataProviderConfig = /** @class */ (function () {
    function DataProviderConfig(dataProviderName, queueWorker) {
        var _this = this;
        this.searchPropertyWhitelist = undefined;
        this.getActionUrlConfig = function () {
            return null;
        };
        /**
         * Returns the name of the attribute, that should be used, to decide,
         * if data coming from the backend are newer than the local copy.
         *
         * The default implemantion returns 'updated_at', which is the common
         * handling in Ruby on Rails.
         *
         * @method getUpdatedAtAttributeName
         * @return {string} attributeName
         */
        this.getUpdatedAtAttributeName = function () {
            return 'updated_at';
        };
        /**
         * List of attributes that are relevant to determine the identity of ONE DataModel instance.
         * In the most cases the default implementation returning just id is perfect and does not need
         * any adjustment.
         *
         * @method getIdentityRelevantAttributeNames
         * @return {string[]}
         */
        this.getIdentityRelevantAttributeNames = function () {
            return ['id'];
        };
        this.getNewInstanceDataModelScopeNames = function () {
            return [internal_3.DEFAULT_SCOPE_NAME];
        };
        this.getInitialRequestMoment = function () {
            return 'on_first_collection';
        };
        /**
         * Lifetime of cache, before fetch data again from its sources.
         * @method getDataCacheLifetime
         * @return {Duration}
         */
        this.getDataCacheLifetime = function () {
            return new internal_2.Duration(6000 * 10 * 10);
        };
        /**
         * The data will automatically refetch from its sources after the refetch interval.
         * @todo
         * @method getRefetchInterval
         * @return {Duration}
         */
        this.getRefetchInterval = function () {
            return new internal_2.Duration(1000);
        };
        this.getActionUrlSet = function () {
            return new internal_1.ActionUrlSet(_this.getActionUrlConfig());
        };
        this.computePayloadForRequest = function (requestData) {
            return requestData.dataModel.mapDataOut(requestData);
        };
        this.extractFilterCollectionForSelection = function (dataCollection) {
            return null;
        };
        /**
         * Appends the filters to the given url
         * @method appendFiltersToUrl
         */
        this.appendFiltersToUrl = function (url, filterMarking) {
            var searchParamContent = '';
            var isSearchParamContentPresent = false;
            filterMarking.getUnusedFilters().forEach(function (filterRule) {
                if (!_this.shouldSkipSearchProperty(filterRule.propertyName)) {
                    if (isSearchParamContentPresent) {
                        searchParamContent += '&';
                    }
                    searchParamContent += filterRule.asUrlString();
                    isSearchParamContentPresent = true;
                }
            });
            if (searchParamContent.length == 0) {
                return url;
            }
            else {
                var qmOrAmp = (url.indexOf('?') === -1) ? '?' : '&';
                return "" + url + qmOrAmp + _this.getSearchParamName() + "=" + encodeURIComponent(searchParamContent);
            }
        };
        this.computeSelectionUrl = function (scopeName, selectionTriggerCollection) {
            var url = _this.getUrl(scopeName);
            var variables = _this.extractVariablesFromUrl(url);
            var areVariablesAvailable = variables.length > 0;
            if (!selectionTriggerCollection) {
                if (areVariablesAvailable) {
                    return null;
                    //throw new Error('Variables cannot be filled, without connected collection.')
                }
                else {
                    return url;
                }
            }
            else {
                var filterMarking = new FilterMarking_1.FilterMarking(selectionTriggerCollection.topCollection);
                if (areVariablesAvailable) {
                    var map = void 0;
                    try {
                        map = _this.buildReplacementMap(variables, filterMarking);
                    }
                    catch (e) {
                        if (e instanceof NotEnoughFiltersError_1.NotEnoughFiltersError) {
                            return null;
                        }
                        throw e;
                    }
                    url = _this.replaceVariablesInUrl(url, map);
                }
                return _this.appendFiltersToUrl(url, filterMarking);
            }
        };
        this._dataProviderName = dataProviderName;
        this._queueWorker = queueWorker;
    }
    DataProviderConfig.prototype.getNewUrlVariableMatcher = function () {
        return /\$\{([a-z\.\_]*)\}/gm;
    };
    DataProviderConfig.prototype.extractVariableAndModifier = function (variableWithModifier) {
        var variableModifierSplitted = variableWithModifier.split('.');
        var computedModifier = (variableModifierSplitted.length > 1) ? variableModifierSplitted[1] : '==';
        if (computedModifier == 'gte') {
            computedModifier = '>=';
        }
        else if (computedModifier == 'lte') {
            computedModifier = '<=';
        }
        return {
            variable: variableModifierSplitted[0].toString(),
            modifier: computedModifier
        };
    };
    DataProviderConfig.prototype.markingFinderByModifier = function (modifier) {
        switch (modifier) {
            case '==': /* fall through */
            case '>=': /* fall through */
            case '<=':
                {
                    return function (filterRule) {
                        return filterRule.comparator == modifier;
                    };
                }
            case 'low': /* fall through */
            case 'high':
                {
                    return function (filterRule) {
                        return filterRule instanceof FilterRuleIn_1.FilterRuleIn;
                    };
                }
            default:
                {
                    throw new Error("Variable modifier with name '" + modifier + "' not implemented.");
                }
        }
    };
    DataProviderConfig.prototype.getValueByWithModifier = function (filterRuleMarker, modifier) {
        var filterRule = filterRuleMarker.use();
        switch (modifier) {
            default:
                return filterRule.value;
            case 'low':
                return filterRule.valueRange.startValue;
            case 'high':
                return filterRule.valueRange.endValue;
        }
    };
    DataProviderConfig.prototype.findReplacement = function (variableWithModifier, filterMarking) {
        var variableModifierSplitted = this.extractVariableAndModifier(variableWithModifier);
        var markingFinder = this.markingFinderByModifier(variableModifierSplitted.modifier);
        var filterMarker = filterMarking.filterMarkersForProperty(variableModifierSplitted.variable, markingFinder);
        switch (filterMarker.length) {
            case 0:
                throw new NotEnoughFiltersError_1.NotEnoughFiltersError("There must be a FilterRule supporting modifier '" + variableModifierSplitted.modifier + "' for the property '" + variableModifierSplitted.variable + "' in the DataCollection.");
            case 1:
                return this.getValueByWithModifier(filterMarker[0], variableModifierSplitted.modifier);
            default:
                throw new TooManyFiltersError_1.TooManyFiltersError("There must be exactly one FilterRule supporting modifier '" + variableModifierSplitted.modifier + "' for the property '" + variableModifierSplitted.variable + "' in the DataCollection.");
        }
    };
    DataProviderConfig.prototype.buildReplacementMap = function (variables, filterMarking) {
        var _this = this;
        var map = {};
        variables.forEach(function (variable) {
            map[variable.toString()] = _this.findReplacement(variable.toString(), filterMarking);
        });
        return map;
    };
    DataProviderConfig.prototype.matchUrlAndCycle = function (url, callback) {
        var variableMatcher = this.getNewUrlVariableMatcher();
        var match;
        while (match = variableMatcher.exec(url)) {
            callback(match);
        }
    };
    DataProviderConfig.prototype.extractVariablesFromUrl = function (url) {
        var variables = [];
        this.matchUrlAndCycle(url, function (match) {
            variables.push(match[1]);
        });
        return variables;
    };
    DataProviderConfig.prototype.replaceVariablesInUrl = function (url, map) {
        this.matchUrlAndCycle(url, function (match) {
            url = url.replace(match[0], map[match[1]].toString());
        });
        return url;
    };
    DataProviderConfig.prototype.getScope = function (scopeName) {
        return this.getScopes()[scopeName];
    };
    DataProviderConfig.prototype.hasUrl = function (scopeName) {
        return this.getUrl(scopeName) != undefined;
    };
    DataProviderConfig.prototype.getUrl = function (scopeName) {
        var scopeOrUrl = this.getScope(scopeName);
        if (typeof scopeOrUrl == 'string') {
            return scopeOrUrl;
        }
        else {
            return scopeOrUrl['url'];
        }
    };
    DataProviderConfig.prototype.getSearchParamName = function () {
        return 'search';
    };
    DataProviderConfig.prototype.getInitialEntities = function (scopeName) {
        var scopeOrUrl = this.getScope(scopeName);
        if (typeof scopeOrUrl != 'string') {
            var url = scopeOrUrl['url'];
            return scopeOrUrl['initialEntities'];
        }
        return null;
    };
    Object.defineProperty(DataProviderConfig.prototype, "dataProviderName", {
        /**
         * Attribute accessor to get the data providers name
         */
        get: function () {
            return this._dataProviderName;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DataProviderConfig.prototype, "queueWorker", {
        /**
         * Attribute accessor to get the queueWorker used for this DataProvider
         */
        get: function () {
            return this._queueWorker;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Surpresses the identity hash code warning, if set to true in a subclass.
     *
     * Please be really sure, what you do, when overriding this. In most cases,
     * you did not correctly configured the getIdentityRelevantAttributeNames.
     *
     * @method shouldSurpressIdentityHashCodeWarning
     * @return {boolean}
     */
    DataProviderConfig.prototype.shouldSurpressIdentityHashCodeWarning = function () {
        return false;
    };
    DataProviderConfig.prototype.shouldSkipSearchProperty = function (propertyName) {
        if (this.searchPropertyWhitelist === undefined) {
            return false;
        }
        return this.searchPropertyWhitelist.indexOf(propertyName) === -1;
    };
    DataProviderConfig.prototype.getSearchPropertyWhitelist = function () {
        return this.searchPropertyWhitelist;
    };
    /**
     * Retuns the duration, a {DataModel} should wait until it propagates changes to its listeners.
     * The time resets after every change.
     *
     * Listeners, which are created with the optional *critical* flag do not respect this value.
     * @name getChangePropagateWaitDuration
     * @returns {Duration}
     */
    DataProviderConfig.prototype.getChangePropagateWaitDuration = function () {
        return new internal_2.Duration(100);
    };
    DataProviderConfig.prototype.getBackendConnectorQueueName = function () {
        return internal_3.DEFAULT_BACKEND_CONNECTOR_QUEUE_NAME;
    };
    DataProviderConfig.prototype.prepareForServer = function (requestData) {
        return requestData.dataModel.mapDataOut(requestData);
    };
    DataProviderConfig.prototype.unwrapFromServer = function (requestData, objectMap) {
        return objectMap;
    };
    return DataProviderConfig;
}());
exports.DataProviderConfig = DataProviderConfig;
