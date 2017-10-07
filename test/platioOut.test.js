'use strict';

var should = require('should');
require('should-sinon');
var sinon = require('sinon');

describe('PlatioOut', function () {
    var RED = void 0;
    var PlatioOut = void 0;

    beforeEach(function () {
        RED = {
            nodes: {
                createNode: function createNode(node, config) {
                    node.credentials = {};
                    node.on = sinon.stub();
                    node.send = sinon.stub();
                    node.error = sinon.stub();
                },
                registerType: function registerType(name, Node, options) {
                    PlatioOut = Node;
                }
            }
        };
        require('../src/platioOut')(RED);
    });

    it('should make it an error when the payload is not an object', function () {
        var platioOut = new PlatioOut({});
        var msg = {};
        platioOut.handleInput(msg);
        platioOut.error.should.be.calledWithExactly('Invalid payload', msg);
    });

    it('should send a message if it creates a new record', function () {
        var platioOut = new PlatioOut({
            applicationId: 'applicationId',
            collectionId: 'collectionId'
        });
        platioOut.credentials = {
            authorization: 'token'
        };

        var payload = {
            values: {
                c1234567: {
                    type: 'String',
                    value: 'test'
                }
            }
        };
        var msg = {
            payload: payload
        };
        var responseBody = {
            id: 'r12345678901234567890123456'
        };
        sinon.stub(platioOut, 'sendRequest').yields(responseBody);
        platioOut.handleInput(msg);
        platioOut.send.should.be.calledWithExactly({
            payload: responseBody
        });
        platioOut.sendRequest.should.be.calledWithExactly({
            method: 'POST',
            body: payload
        }, msg, sinon.match.func);
    });

    it('should send a message if it updates an existing record', function () {
        var platioOut = new PlatioOut({
            applicationId: 'applicationId',
            collectionId: 'collectionId',
            recordId: 'recordId'
        });
        platioOut.credentials = {
            authorization: 'token'
        };

        var payload = {
            values: {
                c1234567: {
                    type: 'String',
                    value: 'test'
                }
            }
        };
        var msg = {
            payload: payload
        };
        var responseBody = {
            id: 'r12345678901234567890123456'
        };
        sinon.stub(platioOut, 'sendRequest').yields(responseBody);
        platioOut.handleInput(msg);
        platioOut.send.should.be.calledWithExactly({
            payload: responseBody
        });
        platioOut.sendRequest.should.be.calledWithExactly({
            method: 'PUT',
            body: payload
        }, msg, sinon.match.func);
    });

    it('should send a message if it deletes an existing record', function () {
        var platioOut = new PlatioOut({
            applicationId: 'applicationId',
            collectionId: 'collectionId',
            recordId: 'recordId',
            delete: true
        });
        platioOut.credentials = {
            authorization: 'token'
        };

        var payload = {
            values: {
                c1234567: {
                    type: 'String',
                    value: 'test'
                }
            }
        };
        var msg = {
            payload: payload
        };
        var responseBody = '';
        sinon.stub(platioOut, 'sendRequest').yields(responseBody);
        platioOut.handleInput(msg);
        platioOut.send.should.be.calledWithExactly({
            payload: responseBody
        });
        platioOut.sendRequest.should.be.calledWithExactly({
            method: 'DELETE'
        }, msg, sinon.match.func);
    });
});