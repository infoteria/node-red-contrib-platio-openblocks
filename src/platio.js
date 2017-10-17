'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require('lodash');
var assert = require('assert');
var request = require('request');
require('./compat');

var Platio = function () {
    function Platio(RED, config) {
        _classCallCheck(this, Platio);

        RED.nodes.createNode(this, config);

        this._config = config;

        this.on('input', _.bind(this.handleInput, this));
    }

    /* istanbul ignore next */


    _createClass(Platio, [{
        key: 'handleInput',
        value: function handleInput(msg) {
            assert(false);
        }
    }, {
        key: 'sendRequest',
        value: function sendRequest(options, msg, callback) {
            var _this = this;

            var baseURL = 'https://api.plat.io/v1';

            var requestParameters = _.defaultTo(msg.platio, {});
            var applicationId = this.getProperty(requestParameters, 'applicationId', '');
            var collectionId = this.getProperty(requestParameters, 'collectionId', '');
            var recordId = this.getProperty(requestParameters, 'recordId', '');

            var url = baseURL + '/' + applicationId + '/collections/' + collectionId + '/records';
            if (!_.isEmpty(recordId)) {
                url += '/' + recordId;
            }

            return request(_.extend({
                url: url,
                headers: {
                    Authorization: this.getCredential(requestParameters, 'authorization', '')
                },
                json: true
            }, options), function (error, response, body) {
                if (error) {
                    _this.error(error, msg);
                } else if (200 <= response.statusCode && response.statusCode <= 300) {
                    callback(body);
                } else {
                    _this.error(_this._getErrorMessage(body), msg);
                }
            });
        }
    }, {
        key: 'getProperty',
        value: function getProperty(requestParameters, name, defaultValue) {
            return _.defaultTo(_.defaultTo(requestParameters[name], this._config[name]), defaultValue);
        }
    }, {
        key: 'getCredential',
        value: function getCredential(requestParameters, name, defaultValue) {
            return _.defaultTo(_.defaultTo(requestParameters[name], _.get(this.credentials, name)), defaultValue);
        }
    }, {
        key: '_getErrorMessage',
        value: function _getErrorMessage(body) {
            if (_.isObject(body)) {
                return _.defaultTo(body.code, 'Unknown error');
            } else if (!_.isNil(body)) {
                return body.toString();
            } else {
                return 'Unknown error';
            }
        }
    }], [{
        key: 'register',
        value: function register(RED, name, clazz) {
            // With older versions of Node-RED such as 0.13.4,
            // RED.nodes.registerType replaces the prototype of
            // the prototype of the constructor.
            // So its prototype chain becomes Platio(In|Out) -> Node,
            // instead of Platio(In|Out) -> Platio -> Node.
            // We'll restore these prototypes here to fix this broken chain.
            // This will do nothing with the latest Node-RED (0.17.5).
            function restoringPrototypes(action) {
                var proto = Object.getPrototypeOf(clazz.prototype);

                action();

                var replacedProto = Object.getPrototypeOf(clazz.prototype);
                if (replacedProto !== proto) {
                    Object.setPrototypeOf(proto, replacedProto);
                    Object.setPrototypeOf(clazz.prototype, proto);
                }
            }

            restoringPrototypes(function () {
                RED.nodes.registerType(name, clazz, {
                    credentials: {
                        authorization: {
                            type: 'password'
                        }
                    }
                });
            });
        }
    }]);

    return Platio;
}();

module.exports = Platio;