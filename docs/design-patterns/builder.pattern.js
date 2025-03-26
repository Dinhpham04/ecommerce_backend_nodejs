
class Person {
    constructor(name, age, gender, address, phone, email) {
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.address = address;
        this.phone = phone;
        this.email = email;
    }

    getInfo() {
        return `Name: ${this.name}, Age: ${this.age}, Gender: ${this.gender}, Address: ${this.address}, Phone: ${this.phone}, Email: ${this.email}`;
    }
}

class PersonBuilder {
    constructor() {
        this.name = ""
        this.age = 0;
        this.gender = "";
        this.address = "";
        this.phone = "";
        this.email = "";
    }

    withName(name) {
        this.name = name;
        return this;
    }

    withAge(age) {
        this.age = age;
        return this;
    }

    withGender(gender) {
        this.gender = gender;
        return this;
    }

    withAddress(address) {
        this.address = address;
        return this;
    }

    withPhone(phone) {
        this.phone = phone;
        return this;
    }

    withEmail(email) {
        this.email = email;
        return this;
    }

    build() {
        return new Person(this);
    }
}