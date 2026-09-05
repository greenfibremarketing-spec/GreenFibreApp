function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

export function buildEasebuzzFormHtml(paymentData, easebuzzUrl) {
    const fields = Object.entries(paymentData || {})
        .map(([key, value]) => (
            `<input type="hidden" name="${escapeHtml(key)}" value="${escapeHtml(value)}" />`
        ))
        .join('');

    return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Redirecting to payment...</title>
  </head>
  <body>
    <p style="font-family: sans-serif; text-align: center; margin-top: 40px;">
      Redirecting to secure payment...
    </p>
    <form id="easebuzz-payment-form" method="POST" action="${escapeHtml(easebuzzUrl)}">
      ${fields}
    </form>
    <script>
      document.getElementById('easebuzz-payment-form').submit();
    </script>
  </body>
</html>`;
}

export function parseEasebuzzCallbackUrl(url) {
    if (!url) {
        return null;
    }

    try {
        const parsed = new URL(url);
        const params = {};

        parsed.searchParams.forEach((value, key) => {
            params[key] = value;
        });

        if (Object.keys(params).length === 0) {
            return null;
        }

        return params;
    }
    catch {
        const queryIndex = url.indexOf('?');
        if (queryIndex === -1) {
            return null;
        }

        const query = url.slice(queryIndex + 1);
        const params = {};
        query.split('&').forEach((pair) => {
            const [key, value] = pair.split('=');
            if (key) {
                params[decodeURIComponent(key)] = decodeURIComponent(value || '');
            }
        });

        return Object.keys(params).length > 0 ? params : null;
    }
}

export function isEasebuzzCallbackUrl(url) {
    if (!url) {
        return false;
    }

    const lower = url.toLowerCase();
    return lower.includes('/orders/success')
        || lower.includes('/orders/failed')
        || lower.includes('status=success')
        || lower.includes('status=failure');
}

export function isEasebuzzFailureUrl(url) {
    if (!url) {
        return false;
    }

    const lower = url.toLowerCase();
    return lower.includes('/orders/failed') || lower.includes('status=failure');
}
