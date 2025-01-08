// without simple factory pattern

const serviceLogicstics = (cargoVolume) => {
    switch (cargoVolume) {
        case '10':
            return {
                name: 'truck 10',
                doors: 6,
                price: '100.000.000VND'
            }
        case '20':
            return {
                name: 'truck 20',
                doors: 6,
                price: '200.000.000VND'
            }
    }
}

// console.log(serviceLogicstics(20));

// with simple factory pattern 

class ServiceLogicstics {

    constructor(doors = 6, price = '100.000 VND', name = 'truck') {
        this.name = name;
        this.doors = doors;
        this.price = price;
    }

    static getTransport = (cargoVolume) => {
        switch (cargoVolume) {
            case '10':
                return new ServiceLogicstics(6, '100.000.000VND', 'truck 10');
            case '20':
                return new ServiceLogicstics(6, '200.000.000VND', 'truck 20');
            default:
                throw new Error('Unsupported cargo volume');
        }
    }
}

console.log(ServiceLogicstics.getTransport('20'))