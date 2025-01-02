// task caculate product price when appliding discount
function getPrice(originalPrice, typePromotion = 'default') {

    // 20% discount when pre-ordering vinfast product
    if (typePromotion === 'preOrder') {
        return originalPrice * 0.8;
    }

    // Khuyến mại thông thường
    if (typePromotion === 'promotion') {
        return originalPrice <= 200 ? originalPrice * 0.9 : originalPrice - 30;
    }

    // Khi không có khuyến mại 
    if (typePromotion === 'default') {
        return originalPrice;
    }
}

console.log('--->Price:::', getPrice(200, 'preOrder'));