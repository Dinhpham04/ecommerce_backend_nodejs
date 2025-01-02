class Leader {
    recieveRequest(offer) {
        console.log(`result::${offer}`)
    }
}

class Secretary {
    constructor() {
        this.leader = new Leader();
    }

    recieveRequest(offer) {
        // 
        this.leader.recieveRequest(offer);
    }
}

class Developer {
    constructor(offer) {
        this.offer = offer
    }

    applyFor(target) {
        target.recieveRequest(this.offer);
    }
}

// How to use 

const devs = new Developer('I want upto 5K USD');
devs.applyFor(new Secretary());

// là một chủ thể đứng giữa các chủ thể khác để nhận và gửi dữ liệu