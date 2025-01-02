
const preOrderPrice = (originalPrice) => {
    return originalPrice * 0.8;
}

const promotionPrice = (originalPrice) => {
    return originalPrice <= 200 ? originalPrice * 0.9 : originalPrice - 30;
}

const defaultPrice = (originalPrice) => {
    return originalPrice;
}

const dayPrice = (originalPrice) => {
    return originalPrice * 0.6;
}

const blackFridayPrice = (originalPrice) => {
    return originalPrice * 0.5;
}

const getPriceStrategies = new Map([
    ['preOrder', preOrderPrice],
    ['promotion', promotionPrice],
    ['default', defaultPrice],
    ['day', dayPrice],
    ['blackFriday', blackFridayPrice]
])


const getPrice = (originalPrice, typePromotion = 'default') => {
    return getPriceStrategies.get(typePromotion)(originalPrice);
}

console.log('--->Price:::', getPrice(200, 'day'));