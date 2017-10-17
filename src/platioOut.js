'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = require('lodash');
var Platio = require('./platio');

module.exports = function (RED) {
    var PlatioOut = function (_Platio) {
        _inherits(PlatioOut, _Platio);

        function PlatioOut(config) {
            _classCallCheck(this, PlatioOut);

            return _possibleConstructorReturn(this, (PlatioOut.__proto__ || Object.getPrototypeOf(PlatioOut)).call(this, RED, config));
        }

        _createClass(PlatioOut, [{
            key: 'handleInput',
            value: function handleInput(msg) {
                var _this2 = this;

                var payload = msg.payload;
                if (!_.isObject(payload)) {
                    return this.error('Invalid payload', msg);
                }

                var requestParameters = _.defaultTo(msg.platio, {});
                var options = this._buildRequestOptions(requestParameters, payload);
                this.sendRequest(options, msg, function (body) {
                    msg.payload = body;
                    _this2.send(msg);
                });
            }
        }, {
            key: '_buildRequestOptions',
            value: function _buildRequestOptions(requestParameters, body) {
                var recordId = this.getProperty(requestParameters, 'recordId', '');
                var deleteRecord = this.getProperty(requestParameters, 'delete', false);

                if (_.isEmpty(recordId)) {
                    return {
                        method: 'POST',
                        body: body
                    };
                } else if (deleteRecord) {
                    return {
                        method: 'DELETE'
                    };
                } else {
                    return {
                        method: 'PUT',
                        body: body
                    };
                }
            }
        }]);

        return PlatioOut;
    }(Platio);

    Platio.register(RED, 'platio out', PlatioOut);
};