'use strict';

var proxyquire = require('proxyquire');
var should = require('should');
var sinon = require('sinon');

describe('Platio', function () {
    var RED = void 0;
    var Platio = void 0;
    var request = void 0;

    beforeEach(function () {
        RED = {
            nodes: {
                createNode: function createNode(node, config) {
                    node.credentials = {};
                    node.on = sinon.stub();
                    node.error = sinon.stub();
                }
            }
        };
        request = sinon.stub();
        Platio = proxyquire('../src/platio', {
            request: request
        });
    });

    describe('sendRequest', function () {
        it('should send a request to records', function () {
            var platio = new Platio(RED, {});
            var response = {
                statusCode: 204
            };
            var body = {
                test: 'value'
            };
            request.yields(null, response, body);
            var callback = sinon.stub();
            platio.sendRequest({
                method: 'POST',
                body: {
                    foo: 'bar'
                }
            }, {
                platio: {
                    applicationId: 'applicationId',
                    collectionId: 'collectionId',
                    authorization: 'token'
                }
            }, callback);

            request.should.be.calledWithExactly({
                url: 'https://api.plat.io/v1/applicationId/collections/collectionId/records',
                method: 'POST',
                headers: {
                    Authorization: 'token'
                },
                body: {
                    foo: 'bar'
                },
                json: true
            }, sinon.match.func);
            callback.should.be.calledWithExactly(body);
        });

        it('should send a request to a record', function () {
            var platio = new Platio(RED, {});
            var response = {
                statusCode: 200
            };
            var body = {
                test: 'value'
            };
            request.yields(null, response, body);
            var callback = sinon.stub();
            platio.sendRequest({
                method: 'GET'
            }, {
                platio: {
                    applicationId: 'applicationId',
                    collectionId: 'collectionId',
                    recordId: 'recordId',
                    authorization: 'token'
                }
            }, callback);

            request.should.be.calledWithExactly({
                url: 'https://api.plat.io/v1/applicationId/collections/collectionId/records/recordId',
                method: 'GET',
                headers: {
                    Authorization: 'token'
                },
                json: true
            }, sinon.match.func);
            callback.should.be.calledWithExactly(body);
        });

        it('should call this.error if error', function () {
            var platio = new Platio(RED, {});
            var error = new Error('error');
            request.yields(error);
            var msg = {
                platio: {
                    applicationId: 'applicationId',
                    collectionId: 'collectionId',
                    authorization: 'token'
                }
            };
            var callback = sinon.stub();
            platio.sendRequest({
                method: 'POST',
                body: {
                    foo: 'bar'
                }
            }, msg, callback);

            callback.should.not.be.called();
            platio.error.should.be.calledWithExactly(error, msg);
        });

        it('should call this.error if failure response', function () {
            var platio = new Platio(RED, {});
            var response = {
                statusCode: 404
            };
            var body = {
                code: 'APPLICATION_NOT_FOUND'
            };
            request.yields(null, response, body);
            var msg = {
                platio: {
                    applicationId: 'applicationId',
                    collectionId: 'collectionId',
                    authorization: 'token'
                }
            };
            var callback = sinon.stub();
            platio.sendRequest({
                method: 'POST',
                body: {
                    foo: 'bar'
                }
            }, msg, callback);

            callback.should.not.be.called();
            platio.error.should.be.calledWithExactly('APPLICATION_NOT_FOUND', msg);
        });
    });

    describe('getProperty', function () {
        it('should return a property from request parameters', function () {
            var platio = new Platio(RED, {});
            platio.getProperty({
                name: 'test'
            }, 'name', 'default').should.equal('test');
        });

        it('should return a property from config', function () {
            var platio = new Platio(RED, {
                name: 'test'
            });
            platio.getProperty({}, 'name', 'default').should.equal('test');
        });

        it('should return a default value', function () {
            var platio = new Platio(RED, {});
            platio.getProperty({}, 'name', 'default').should.equal('default');
        });
    });

    describe('getCredential', function () {
        it('should return a credential from request parameters', function () {
            var platio = new Platio(RED, {});
            platio.getCredential({
                authorization: 'test'
            }, 'authorization', 'default').should.equal('test');
        });

        it('should return a credential from config', function () {
            var platio = new Platio(RED, {});
            platio.credentials = {
                authorization: 'test'
            };
            platio.getCredential({}, 'authorization', 'default').should.equal('test');
        });

        it('should return a default value', function () {
            var platio = new Platio(RED, {});
            platio.getCredential({}, 'authorization', 'default').should.equal('default');
        });
    });

    describe('_getErrorMessage', function () {
        var platio = void 0;

        beforeEach(function () {
            platio = new Platio(RED, {});
        });

        it('should return code if body is an object', function () {
            platio._getErrorMessage({
                code: 'APPLICATION_NOT_FOUND'
            }).should.equal('APPLICATION_NOT_FOUND');
        });

        it('should return Unknown error if no code', function () {
            platio._getErrorMessage({}).should.equal('Unknown error');
        });

        it('should return the body itself if not nil', function () {
            platio._getErrorMessage('Error').should.equal('Error');
        });

        it('should return Unknown error if nil', function () {
            platio._getErrorMessage(undefined).should.equal('Unknown error');
        });
    });
});