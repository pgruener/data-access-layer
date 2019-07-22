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
var FilterRule_1 = require("./FilterRule");
var MATCHER_FUNCTION = function (value, regexp) {
    var REGEXP_MATCHER = /^\/(.*)\/([eimg]*)$/;
    /**
     * @example
     *   /.A/ig  => [ "/.A/ig", ".A", "ig" ]
     */
    var foundRegExp = regexp.toString().match(REGEXP_MATCHER);
    var search;
    if (foundRegExp == null) {
        search = regexp;
    }
    else {
        var pattern = foundRegExp[1];
        var flags = foundRegExp[2];
        search = new RegExp(pattern, flags);
    }
    return value.toString().match(search) != null;
};
var FilterRuleMatch = /** @class */ (function (_super) {
    __extends(FilterRuleMatch, _super);
    function FilterRuleMatch(propertyName, pattern) {
        return _super.call(this, propertyName, MATCHER_FUNCTION, pattern) || this;
    }
    FilterRuleMatch.prototype.asUrlString = function () {
        return encodeURIComponent("match(" + this.propertyName + ", " + this.value + ")");
    };
    return FilterRuleMatch;
}(FilterRule_1.FilterRule));
exports.FilterRuleMatch = FilterRuleMatch;
