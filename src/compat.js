'use strict';

var _ = require('lodash');

/* istanbul ignore next */
(function () {
    if (_.isUndefined(_.defaultTo)) {
        _.defaultTo = function (value, defaultValue) {
            return _.isUndefined(value) ? defaultValue : value;
        };
    }

    if (_.isUndefined(_.omitBy)) {
        _.omitBy = _.omit;
    }

    if (_.isUndefined(_.concat)) {
        _.concat = function (array, anotherArray) {
            return [].concat(array, anotherArray);
        };
    }

    if (_.isUndefined(_.isNil)) {
        _.isNil = function (value) {
            return _.isUndefined(value) || _.isNull(value);
        };
    }
})();