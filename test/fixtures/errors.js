module.exports.RESTInvalidAccount = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'Parameter is not a valid Ripple address: account'
});

module.exports.RESTInvalidDestinationAccount = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'Parameter is not a valid Ripple address: destination_account'
});

module.exports.RESTInvalidDestinationAmount = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'Invalid parameter: destination_amount',
  message: 'Must be an amount string in the form value+currency+issuer'
});

module.exports.RESTInvalidCounterparty = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'Parameter is not a valid Ripple address: counterparty'
});

module.exports.RESTInvalidTransactionHash = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'Transaction not found',
  message: 'Missing hash'
});

module.exports.RESTTransactionNotFound = JSON.stringify({
  success: false,
  error_type: 'transaction',
  error: 'txnNotFound',
  message: 'Transaction not found.'
});

module.exports.RESTInvalidCurrency = JSON.stringify({
  success: false,
  error_type: 'invalid_request',
  error: 'Parameter is not a valid currency: currency'
});

module.exports.RESTAccountNotFound = JSON.stringify({
  success: false,
  error_type: 'transaction',
  error: 'actNotFound',
  message: 'Account not found.'
});

module.exports.RESTCannotConnectToRippleD = JSON.stringify({
  success: false,
  error_type: 'connection',
  error: 'Cannot connect to rippled'
});