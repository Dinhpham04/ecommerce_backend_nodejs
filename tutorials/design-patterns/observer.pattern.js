class Observer {
    constructor(name) {
        // sniper, riki
        this.namePick = name;
    }

    updateStatus(location) {
        this.goToHelp(location);
    }

    goToHelp(location) {
        console.log(`${this.namePick}::::PING::::${JSON.stringify(location)}`);
    }
}

// Observer là một đối tượng dùng để đăng ký nhận thông báo từ Subject
// Observer có 1 giao diện hoặc phương thức để cập nhật trại thái khi có sự kiện xảy ra 

class Subject {
    constructor() {
        this.observers = [];
    }

    addObserver(observer) {
        this.observers.push(observer);
    }

    removeObserver(observer) {
        this.observers = this.observers.filter(item => item !== observer);
    }

    notify(location) {
        this.observers.forEach(observer => observer.updateStatus(location));
    }
}

// Subject là một chủ thể được quan sát
// Khi subject có sự thay đổi nó sẽ gửi thông báo đến các observer đã đăng ký


const subject = new Subject();

const sniper = new Observer('sniper');
const riki = new Observer('riki');
const pudge = new Observer('pudge');

subject.addObserver(sniper);
subject.addObserver(riki);
subject.addObserver(pudge);
subject.removeObserver(pudge);
subject.notify({ long: 123, lat: 456 });