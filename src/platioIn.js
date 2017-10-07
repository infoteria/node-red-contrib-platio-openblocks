'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require('lodash');
var assert = require('assert');
var Platio = require('./platio');

var maxLimit = 100;

var Fetcher = function () {
    function Fetcher(node) {
        _classCallCheck(this, Fetcher);

        this.node = node;
    }

    /* istanbul ignore next */


    _createClass(Fetcher, [{
        key: 'fetch',
        value: function fetch(msg, callback) {
            assert(false);
        }
    }]);

    return Fetcher;
}();

var SingleRecordFetcher = function (_Fetcher) {
    _inherits(SingleRecordFetcher, _Fetcher);

    function SingleRecordFetcher() {
        _classCallCheck(this, SingleRecordFetcher);

        return _possibleConstructorReturn(this, (SingleRecordFetcher.__proto__ || Object.getPrototypeOf(SingleRecordFetcher)).apply(this, arguments));
    }

    _createClass(SingleRecordFetcher, [{
        key: 'fetch',
        value: function fetch(msg, callback) {
            this.node.sendRequest({
                method: 'GET'
            }, msg, callback);
        }
    }]);

    return SingleRecordFetcher;
}(Fetcher);

var MultiRecordsFetcher = function (_Fetcher2) {
    _inherits(MultiRecordsFetcher, _Fetcher2);

    function MultiRecordsFetcher() {
        _classCallCheck(this, MultiRecordsFetcher);

        return _possibleConstructorReturn(this, (MultiRecordsFetcher.__proto__ || Object.getPrototypeOf(MultiRecordsFetcher)).apply(this, arguments));
    }

    _createClass(MultiRecordsFetcher, [{
        key: 'fetch',
        value: function fetch(msg, callback) {
            var requestParameters = _.defaultTo(msg.platio, {});
            var limit = this.node.getProperty(requestParameters, 'limit', 0);
            return this._fetch(msg, requestParameters, limit, [], callback);
        }
    }, {
        key: '_fetch',
        value: function _fetch(msg, requestParameters, limit, fetchedRecords, callback) {
            var _this3 = this;

            var thisLimit = Math.min(limit, maxLimit);
            var options = this._buildRequestOptions(requestParameters, fetchedRecords.length, thisLimit);
            this.node.sendRequest(options, msg, function (body) {
                var records = body;
                var allRecords = _.concat(fetchedRecords, records);
                var nextLimit = limit - records.length;
                if (records.length < thisLimit || nextLimit <= 0) {
                    callback(allRecords);
                } else {
                    _this3._fetch(msg, requestParameters, nextLimit, allRecords, callback);
                }
            });
        }
    }, {
        key: '_buildRequestOptions',
        value: function _buildRequestOptions(requestParameters, skip, limit) {
            var _this4 = this;

            var params = ['sortKey', 'sortOrder', 'sortColumnId', 'search', 'timezone'];
            var queryString = _.omitBy(_.zipObject(params, _.map(params, function (param) {
                return _this4.node.getProperty(requestParameters, param, '');
            })), _.isEmpty);
            if (limit > 0) {
                _.extend(queryString, {
                    skip: skip,
                    limit: limit
                });
            }

            return {
                method: 'GET',
                qs: queryString
            };
        }
    }]);

    return MultiRecordsFetcher;
}(Fetcher);

module.exports = function (RED) {
    var PlatioIn = function (_Platio) {
        _inherits(PlatioIn, _Platio);

        function PlatioIn(config) {
            _classCallCheck(this, PlatioIn);

            return _possibleConstructorReturn(this, (PlatioIn.__proto__ || Object.getPrototypeOf(PlatioIn)).call(this, RED, config));
        }

        _createClass(PlatioIn, [{
            key: 'handleInput',
            value: function handleInput(msg) {
                var _this6 = this;

                var requestParameters = _.defaultTo(msg.platio, {});

                var recordId = this.getProperty(requestParameters, 'recordId', '');

                var Fetcher = !_.isEmpty(recordId) ? SingleRecordFetcher : MultiRecordsFetcher;
                var fetcher = new Fetcher(this);
                fetcher.fetch(msg, function (payload) {
                    msg.payload = payload;
                    _this6.send(msg);
                });
            }
        }]);

        return PlatioIn;
    }(Platio);

    RED.nodes.registerType('platio in', PlatioIn, {
        credentials: {
            authorization: {
                type: 'password'
            }
        }
    });
};