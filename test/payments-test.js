var assert = require('assert');
var ripple = require('ripple-lib');
var _ = require('lodash');
var testutils = require('./testutils');
var fixtures = require('./fixtures').payments;
var errors = require('./fixtures').errors;
var addresses = require('./fixtures').addresses;
var requestPath = fixtures.requestPath;
var Payments = require('./../api/payments');

describe('get payments', function() {
  var self = this;

  //self.wss: rippled mock
  //self.app: supertest-enabled REST handler

  beforeEach(testutils.setup.bind(self));
  afterEach(testutils.teardown.bind(self));

  it('/accounts/:account/payments/:identifier', function(done) {
    self.wss.once('request_tx', function(message, conn) {
      assert.strictEqual(message.command, 'tx');
      assert.strictEqual(message.transaction, fixtures.VALID_TRANSACTION_HASH);
      conn.send(fixtures.transactionResponse(message));
    });

    self.app
    .get(requestPath(addresses.VALID) + '/' + fixtures.VALID_TRANSACTION_HASH)
    .expect(testutils.checkStatus(200))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(fixtures.RESTTransactionResponse))
    .end(done);
  });

  it('/accounts/:account/payments/:identifier -- with memos', function(done) {
    self.wss.once('request_tx', function(message, conn) {
      assert.strictEqual(message.command, 'tx');
      assert.strictEqual(message.transaction, fixtures.VALID_TRANSACTION_HASH_MEMO);
      conn.send(fixtures.transactionResponseWithMemo(message));
    });

    self.wss.once('request_ledger', function(message, conn) {
      assert.strictEqual(message.command, 'ledger');
      conn.send(fixtures.ledgerResponse(message));
    });

    self.app
      .get(requestPath('rGUpotx8YYDiocqS577N4T1p1kHBNdEJ9s') + '/' + fixtures.VALID_TRANSACTION_HASH_MEMO)
      .expect(testutils.checkStatus(200))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTTransactionResponseWithMemo))
      .end(done);
  });

  it('/accounts/:account/payments/:identifier -- invalid identifier', function(done) {
    self.wss.once('request_tx', function(message, conn) {
      assert(false, 'Should not request transaction');
    });

    self.app
    .get(requestPath(addresses.VALID) + '/' + fixtures.INVALID_TRANSACTION_HASH)
    .expect(testutils.checkStatus(400))
    .expect(testutils.checkHeaders)
    .expect(testutils.checkBody(errors.RESTInvalidTransactionHash))
    .end(done);
  });
});

describe('post payments', function() {
  var self = this;

  //self.wss: rippled mock
  //self.app: supertest-enabled REST handler

  beforeEach(testutils.setup.bind(self));
  afterEach(testutils.teardown.bind(self));

  it('/payments -- with invalid memos', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.requestSubmitReponse(message));
    })

    var body = _.cloneDeep(fixtures.paymentWithMemo);
    body.payment.memos = "some string";

    self.app
      .post('/v1/accounts/' + addresses.VALID + '/payments')
      .send(body)
      .expect(testutils.checkStatus(400))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTResponseNonArrayMemo))
      .end(done);
  });

  it('/payments -- with empty memos array', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.requestSubmitReponse(message));
    })

    var body = _.cloneDeep(fixtures.paymentWithMemo);
    body.payment.memos = [];

    self.app
      .post('/v1/accounts/' + addresses.VALID + '/payments')
      .send(body)
      .expect(testutils.checkStatus(400))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTResponseEmptyMemosArray))
      .end(done);
  });

  it('/payments -- with memo containing a MemoType field with an int value', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.requestSubmitReponse(message));
    })

    var body = _.cloneDeep(fixtures.paymentWithMemo);
    body.payment.memos[0].MemoType = 1;

    self.app
      .post('/v1/accounts/' + addresses.VALID + '/payments')
      .send(body)
      .expect(testutils.checkStatus(400))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTResponseMemoTypeInt))
      .end(done);
  });

  it('/payments -- with memo containing a MemoData field with an int value', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.requestSubmitReponse(message));
    })

    var body = _.cloneDeep(fixtures.paymentWithMemo);
    body.payment.memos[0].MemoData = 1;

    self.app
      .post('/v1/accounts/' + addresses.VALID + '/payments')
      .send(body)
      .expect(testutils.checkStatus(400))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTResponseMemoDataInt))
      .end(done);
  });

  it('/payments -- with memo, omit MemoData', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.requestSubmitReponse(message));
    })

    var body = _.cloneDeep(fixtures.paymentWithMemo);
    delete body.payment.memos[0].MemoData;

    self.app
      .post('/v1/accounts/' + addresses.VALID + '/payments')
      .send(body)
      .expect(testutils.checkStatus(200))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTResponseMissingMemoData))
      .end(done);
  });

  it('/payments -- with memo', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.requestSubmitReponse(message));
    })

    self.app
      .post('/v1/accounts/' + addresses.VALID + '/payments')
      .send(fixtures.paymentWithMemo)
      .expect(testutils.checkStatus(200))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTPaymentWithMemoResponse))
      .end(done);
  });

  it('/payments -- successful payment with issuer', function(done){
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(message.command, 'account_info');
      assert.strictEqual(message.account, addresses.VALID);
      conn.send(fixtures.accountInfoResponse(message));
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(message.command, 'submit');
      conn.send(fixtures.requestSubmitReponse(message));
    });

    self.app
      .post('/v1/accounts/' + addresses.VALID + '/payments')
      .send(fixtures.nonXrpPaymentWithIssuer)
      .expect(testutils.checkStatus(200))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTNonXrpPaymentWithIssuer))
      .end(done);
  });

  it('/payments -- without issuer', function(done){
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(true, false);
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(true, false);
    });

    self.app
      .post('/v1/accounts/' + addresses.VALID + '/payments')
      .send(fixtures.nonXrpPaymentWithoutIssuer)
      .expect(testutils.checkStatus(400))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTNonXrpPaymentWithoutIssuer))
      .end(done);
  });

  it('/payments -- with invalid secret', function(done) {
    self.wss.once('request_account_info', function(message, conn) {
      assert.strictEqual(true, false);
    });

    self.wss.once('request_submit', function(message, conn) {
      assert.strictEqual(true, false);
    });

    self.app
      .post('/v1/accounts/' + addresses.VALID + '/payments')
      .send(fixtures.nonXrpPaymentWithInvalidSecret)
      .expect(testutils.checkStatus(500))
      .expect(testutils.checkHeaders)
      .expect(testutils.checkBody(fixtures.RESTNonXrpPaymentWithInvalidsecret))
      .end(done);
  });

});

//
// Unit test payments
//

describe('unit test payments', function() {

  it('should parse payment tx', function(done) {
    var transaction = Payments._parsePaymentFromTx(fixtures.txPayment, { account: 'rGUpotx8YYDiocqS577N4T1p1kHBNdEJ9s' }, function(err){
      assert(false, 'callback should not have been called');
    });
    assert.deepEqual(transaction, fixtures.RESTResponsePayment);
    done();
  });

  it('should parse partial payment tx', function(done) {
    var transaction = Payments._parsePaymentFromTx(fixtures.txPartialPayment, { account: 'rDuV4ndTFUn5NjLJSTNfEFMTxqQVeafvxC' }, function(err){
      assert(false, 'callback should not have been called');
    });
    assert.deepEqual(transaction, fixtures.RESTResponsePartialPayment);
    done();
  });

});

