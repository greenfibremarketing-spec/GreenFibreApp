// src/utils/razorpayPayment.js
// Green Fibre — Razorpay Standard Web Checkout HTML Generator

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildRazorpayCheckoutHtml({
  keyId,
  orderId, // Razorpay order_id (e.g. order_xxx)
  amount,  // in paise (e.g. 50000)
  currency = 'INR',
  name = 'Green Fibre',
  description = '100% Sustainable Living Products',
  customerInfo = {},
  notes = {},
  themeColor = '#1C4A2A',
}) {
  const safeKeyId = escapeHtml(keyId);
  const safeOrderId = escapeHtml(orderId);
  const safeAmount = Number(amount) || 0;
  const safeCurrency = escapeHtml(currency);
  const safeName = escapeHtml(name);
  const safeDescription = escapeHtml(description);
  const safeCustomerName = escapeHtml(customerInfo.name || customerInfo.fullName || '');
  const safeCustomerEmail = escapeHtml(customerInfo.email || '');
  const safeCustomerContact = escapeHtml(customerInfo.phone || customerInfo.contact || '');
  const safeThemeColor = escapeHtml(themeColor || '#1C4A2A');

  const notesJson = JSON.stringify(notes || {});

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Green Fibre - Secure Payment</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      background-color: #FAF7F2;
      display: flex;
      flex-direction: column;
      align-items: center;
      justifyContent: center;
      min-height: 100vh;
      padding: 24px;
      color: #1A1A1A;
    }
    .card {
      background: #FFFFFF;
      border-radius: 20px;
      padding: 32px 24px;
      width: 100%;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(28, 74, 42, 0.08);
      border: 1px solid rgba(28, 74, 42, 0.1);
    }
    .logo-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #F0F7F1;
      color: #1C4A2A;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      padding: 6px 14px;
      border-radius: 20px;
      margin-bottom: 16px;
      text-transform: uppercase;
    }
    h2 {
      font-size: 20px;
      font-weight: 700;
      color: #1C4A2A;
      margin-bottom: 8px;
    }
    p.sub {
      font-size: 13px;
      color: #666;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .spinner {
      width: 44px;
      height: 44px;
      border: 3.5px solid #E2E8F0;
      border-top-color: #1C4A2A;
      border-radius: 50%;
      animation: spin 0.9s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .amount-box {
      background: #FAF7F2;
      border-radius: 12px;
      padding: 14px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .amount-label {
      font-size: 12px;
      font-weight: 600;
      color: #666;
    }
    .amount-val {
      font-size: 18px;
      font-weight: 800;
      color: #1C4A2A;
    }
    .security-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 11px;
      color: #666;
      margin-top: 16px;
    }
    .retry-btn {
      display: none;
      width: 100%;
      padding: 14px;
      background: #1C4A2A;
      color: #FFFFFF;
      border: none;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-badge">🌱 Green Fibre Pay</div>
    <div class="spinner" id="loader"></div>
    <h2 id="heading">Connecting to Razorpay...</h2>
    <p class="sub" id="status-msg">Opening secure checkout for UPI, Cards & NetBanking.</p>

    <div class="amount-box">
      <span class="amount-label">Total Payable</span>
      <span class="amount-val">₹${(safeAmount / 100).toFixed(2)}</span>
    </div>

    <button id="retry-btn" class="retry-btn" onclick="openRazorpayModal()">Retry Payment</button>

    <div class="security-badge">
      🔒 <span>256-bit Bank Grade Encryption</span>
    </div>
  </div>

  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <script>
    function sendMessage(type, payload) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, payload: payload || {} }));
      }
    }

    var rzpInstance = null;

    function openRazorpayModal() {
      var heading = document.getElementById('heading');
      var statusMsg = document.getElementById('status-msg');
      var loader = document.getElementById('loader');
      var retryBtn = document.getElementById('retry-btn');

      if (!window.Razorpay) {
        heading.innerText = 'Unable to Load Razorpay';
        statusMsg.innerText = 'Please check your internet connection and try again.';
        retryBtn.style.display = 'block';
        loader.style.display = 'none';
        sendMessage('ERROR', { message: 'Razorpay SDK failed to load' });
        return;
      }

      var options = {
        key: '${safeKeyId}',
        amount: ${safeAmount},
        currency: '${safeCurrency}',
        name: '${safeName}',
        description: '${safeDescription}',
        order_id: '${safeOrderId}',
        prefill: {
          name: '${safeCustomerName}',
          email: '${safeCustomerEmail}',
          contact: '${safeCustomerContact}'
        },
        notes: ${notesJson},
        theme: {
          color: '${safeThemeColor}'
        },
        modal: {
          confirm_close: true,
          ondismiss: function() {
            heading.innerText = 'Payment Incomplete';
            statusMsg.innerText = 'You dismissed the payment prompt.';
            retryBtn.style.display = 'block';
            sendMessage('DISMISSED', { reason: 'user_dismissed' });
          }
        },
        handler: function(response) {
          heading.innerText = 'Verifying Payment...';
          statusMsg.innerText = 'Please wait while we confirm your transaction.';
          loader.style.display = 'block';
          retryBtn.style.display = 'none';
          sendMessage('SUCCESS', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
        }
      };

      try {
        rzpInstance = new window.Razorpay(options);
        rzpInstance.on('payment.failed', function(response) {
          var errDesc = response.error ? response.error.description : 'Transaction failed';
          heading.innerText = 'Payment Failed';
          statusMsg.innerText = errDesc;
          retryBtn.style.display = 'block';
          sendMessage('FAILED', { error: response.error });
        });
        rzpInstance.open();
      } catch (err) {
        heading.innerText = 'Payment Error';
        statusMsg.innerText = err.message || 'Could not open checkout';
        retryBtn.style.display = 'block';
        sendMessage('ERROR', { message: err.message });
      }
    }

    window.onload = function() {
      // Allow slight delay for WebView to stabilize
      setTimeout(openRazorpayModal, 400);
    };
  </script>
</body>
</html>`;
}
