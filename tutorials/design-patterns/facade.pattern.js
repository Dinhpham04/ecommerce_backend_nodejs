class Discount {
    calc(value) {
        return value * 0.9;
    }
}

class Shipping {
    calc(price) {
        return price + 5;
    }
}

class Fees {
    calc(value) {
        return value * 1.05;
    }
}

class ShopeeFacadePattern {
    constructor() {
        this.discount = new Discount();
        this.shipping = new Shipping();
        this.fees = new Fees();
    }

    calc(price) {
        price = this.discount.calc(price);
        price = this.fees.calc(price);
        price = this.fees.calc(price);

        return price;
    }
}

function buy(price) {
    const shopee = new ShopeeFacadePattern(price);
    console.log(`Price::`, shopee.calc(price));
}

buy(120);

// Người dùng không cần quan tâm tới việc hệ thống phức tạp như thế nào chỉ tương tác duy nhất với duy class
// sử dụng các class phức tạp khác nhau thông qua class FacadePattern
