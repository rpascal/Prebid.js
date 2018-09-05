import {
  ajax
} from '../ajax';

// function validationResponse(bids, callback) {
//   console.log('timeout', bids);
//   callback(bids);
// }

function validatorError(error, originalBids, errorCallback) {
  console.log('Error', error);
  // errorCallback.call(context, originalBids);
  errorCallback(error, originalBids);
}

export function interceptedBidsBackHandler(originalBidsBackHandler) {
  console.log('interceptedBidsBackHandler');
  return function (bids, timedOut) {
    console.log('bids', bids);
    if (originalBidsBackHandler != null) {
      validator(bids, {
        success: function (newBids) {
          console.log('success', newBids);
          originalBidsBackHandler.apply($$PREBID_GLOBAL$$, [newBids, timedOut]);
        },
        error: function (error, originalBids) {
          console.log('Error', error);
          originalBidsBackHandler.apply($$PREBID_GLOBAL$$, [originalBids, timedOut]);
        }
      });
    }
  }
}

// export function interceptedBidsBackHandler(bids, timedOut) {
//   console.log('interceptedBidsBackHandler', bids, timedOut);
//   // return function (bids, timedOut) {
//   //   console.log('Hello', bids);
//   //   if (originalBidsBackHandler != null) {
//   //     originalBidsBackHandler.apply($$PREBID_GLOBAL$$, [bids, timedOut]);
//   //   }
//   // }
// }

function validator(bids, callbacks) {
  let timedOut = false;
  const timeout = setTimeout(function () {
    timedOut = true;
    validatorError('Timed out', bids);
    //  validatorError.call(this, ['Timed out', context, bids, callbacks.error])
  }, 10000);
  ajax(
    'http://localhost:4000/service_crawler_api', {
      success: (newBids) => {
        if (!timedOut) {
          clearTimeout(timeout);
          handleResponse(bids, callbacks.success);
        }
      },
      error: (error) => {
        if (!timedOut) {
          console.log('error', error);
          clearTimeout(timeout);
          validatorError(error, bids, callbacks.error);
        }
      }
    },
    JSON.stringify(bids), {
      contentType: 'application/json',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    }
  );
}

function handleResponse(newBids, callback) {
  console.log('Response', newBids);
  callback(newBids);
}
