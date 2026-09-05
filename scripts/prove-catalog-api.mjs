/**
 * Phase 2B catalog API smoke test against production Green Fibre API.
 */
const BASE_URL = process.env.GREEN_FIBRE_API_URL || 'https://api.greenfibre.org/api';

async function request(path) {
    const response = await fetch(`${BASE_URL}${path}`);
    const data = await response.json().catch(() => ({}));
    return { status: response.status, data };
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

async function main() {
    const results = [];

    const list = await request('/product/');
    assert(list.status === 200, `GET /product/ expected 200, got ${list.status}`);
    assert(list.data.success === true, 'GET /product/ success flag missing');
    assert(Array.isArray(list.data.products), 'GET /product/ products must be an array');
    results.push(`GET /product/ -> ${list.status}, count=${list.data.products.length}`);

    const categories = await request('/categories/');
    assert(categories.status === 200, `GET /categories/ expected 200, got ${categories.status}`);
    assert(categories.data.success === true, 'GET /categories/ success flag missing');
    assert(Array.isArray(categories.data.categories), 'GET /categories/ categories must be an array');
    results.push(`GET /categories/ -> ${categories.status}, count=${categories.data.categories.length}`);

    const search = await request('/product/search?q=eco');
    assert(search.status === 200, `GET /product/search expected 200, got ${search.status}`);
    assert(search.data.success === true, 'GET /product/search success flag missing');
    assert(Array.isArray(search.data.products), 'GET /product/search products must be an array');
    results.push(`GET /product/search?q=eco -> ${search.status}, count=${search.data.products.length}`);

    if (list.data.products[0]) {
        const slug = list.data.products[0].slug || list.data.products[0]._id;
        const detail = await request(`/product/${encodeURIComponent(slug)}`);
        assert(detail.status === 200, `GET /product/:slug expected 200, got ${detail.status}`);
        assert(detail.data.product, 'GET /product/:slug missing product');
        results.push(`GET /product/${slug} -> ${detail.status}`);
    } else {
        results.push('GET /product/:slug -> SKIPPED (no products in catalog)');
    }

    console.log('Catalog API smoke test PASS');
    results.forEach((line) => console.log(`  - ${line}`));
}

main().catch((error) => {
    console.error('Catalog API smoke test FAIL');
    console.error(error.message);
    process.exit(1);
});
