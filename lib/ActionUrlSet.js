"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FALLBACK_HTTP_METHOD = 'POST';
/**
 * An ActionUrlSet is created using an {@link ActionUrlConfig}.
 * It maps a url to a http verb, if no verb is given in the ActionUrlConfig.
 *
 * @class ActionUrlSet
 * @see ActionUrlConfig
 */
var ActionUrlSet = /** @class */ (function () {
    function ActionUrlSet(config) {
        var _this = this;
        this.actionUrls = {};
        /**
         * Computes the {@link ActionUrl} for a specific action and DataModel.
         * Replaces all variables in the url with variables from the DataModel.
         * Falls back to variables from optional additionalVariables param.
         *
         * @method computeActionUrl
         * @param {string} action
         * @param {DataModel} dataModel
         * @param {ObjectMap} [additionalVariables]
         * @return {ActionUrl}
         */
        this.computeActionUrl = function (action, dataModel, additionalVariables) {
            // debugger
            var actionUrl = _this.actionUrls[action];
            if (!actionUrl) {
                throw new Error("actionUrl for action " + action + " not defined.");
            }
            var variableFinder = /\$\{([a-z\.\_]*)\}/gm;
            var url = actionUrl.url;
            var match;
            while (match = variableFinder.exec(url)) {
                var variableString = match[0];
                var variableName = match[1];
                var value = dataModel.getProperty(variableName);
                if (value == undefined) {
                    value = additionalVariables[variableName];
                }
                url = url.replace(variableString, value.toString());
            }
            return { method: actionUrl.method, url: url };
        };
        if (config != null) {
            Object.keys(config).forEach(function (actionName) {
                var currentElement = config[actionName];
                if (typeof currentElement == 'string') {
                    _this.actionUrls[actionName] = { url: currentElement, method: ActionUrlSet.guessHttpMethod(actionName) };
                }
                else {
                    _this.actionUrls[actionName] = currentElement;
                }
            });
        }
    }
    /**
     * Guesses the http method based on the actions name. Falls back to 'POST'.
     *
     * @method guessHttpMethod
     * @param {string} actionName
     */
    ActionUrlSet.guessHttpMethod = function (actionName) {
        return ActionUrlSet.verbMethodMap[actionName] || FALLBACK_HTTP_METHOD;
    };
    ActionUrlSet.verbMethodMap = {
        create: 'POST',
        new: 'GET',
        show: 'GET',
        edit: 'GET',
        update: 'PATCH',
        delete: 'DELETE'
    };
    return ActionUrlSet;
}());
exports.ActionUrlSet = ActionUrlSet;
