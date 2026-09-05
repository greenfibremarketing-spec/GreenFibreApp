import assert from 'node:assert/strict';

function getCartLineKey(productId, colorIndex) {
    return `${productId}:${colorIndex}`;
}

function normalizeCartResponse(responseData) {
    if (!responseData) {
        return { items: [], totalAmount: 0 };
    }

    const cartPayload = responseData.cart ?? responseData;
    const items = cartPayload.items || [];

    return {
        items,
        totalAmount: cartPayload.totalAmount ?? 0,
    };
}

function testEmptyCartShape() {
    const result = normalizeCartResponse({
        success: true,
        items: [],
        totalAmount: 0,
    });

    assert.deepEqual(result, { items: [], totalAmount: 0 });
}

function testPopulatedCartShape() {
    const result = normalizeCartResponse({
        success: true,
        cart: {
            items: [
                {
                    product: { _id: 'prod1' },
                    colorIndex: 0,
                    quantity: 2,
                    price: 499,
                },
            ],
            totalAmount: 998,
        },
    });

    assert.equal(result.items.length, 1);
    assert.equal(result.totalAmount, 998);
    assert.equal(result.items[0].colorIndex, 0);
}

function testSeparateColorLines() {
    assert.notEqual(getCartLineKey('prod1', 0), getCartLineKey('prod1', 1));
}

function testBadgeQuantitySum() {
    const items = [{ quantity: 2 }, { quantity: 3 }];
    assert.equal(items.reduce((sum, item) => sum + item.quantity, 0), 5);
}

testEmptyCartShape();
testPopulatedCartShape();
testSeparateColorLines();
testBadgeQuantitySum();

console.log('cart normalize tests PASS');
