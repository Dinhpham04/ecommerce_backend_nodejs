'use strict';

const redisPubSubService = require("../services/redisPubSub.service");

class InventoryServiceTest {
    constructor() {
        redisPubSubService.subscriber('purchase_events', (channel, message) => {
            console.log(`received message: ${message}`)
            InventoryServiceTest.updateInventory(message)
        })
    }

    static updateInventory(productId, quantity) {
        console.log(`updated inventory ${productId} with ${quantity}`)
    }
}

module.exports = new InventoryServiceTest()