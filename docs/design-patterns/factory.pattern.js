// create service Car 

class Car {
    constructor({ name = 'Ford', doors = 4, price = '10000vnd', customerInfo = {} }) {
        this.name = name;
        this.doors = doors;
        this.price = price;
        this.customerInfo = customerInfo;
    }
}

class ServiceLogicstics {
    transportClass = Car
    getTransport = (customerInfo) => {
        return new this.transportClass(customerInfo)
    }
}

// order for customer by car
const carService = new ServiceLogicstics()
// console.log('Car service::', carService.getTransport({ customerInfo: { name: 'GTR', doors: 2, price: '1000000vnd' } }));

// Cach 1 

class Truck {
    constructor({ name = 'Ford', doors = 4, price = '10000vnd', customerInfo = {} }) {
        this.name = name;
        this.doors = doors;
        this.price = price;
        this.customerInfo = customerInfo;
    }
}

carService.transportClass = Truck

// Cach 2 
class TruckService extends ServiceLogicstics {
    transportClass = Truck
}

const truckService = new TruckService()

console.log('TruckService::Class:::', truckService.getTransport({ customeInfo: { name: 'Dinh' } }))