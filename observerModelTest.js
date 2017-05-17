var pub = {
    publish: function() {
        dep.notify();
    }
}

var sub1 = {
    update: function() {
        console.log(1);
    }
}

var sub2 = {
    update: function() {
        console.log(2);
    }
}

var sub3 = {
    update: function() {
        console.log(3);
    }
}

function Dep() {
    this.subs = [sub1, sub2, sub3];
}

Dep.prototype.notify = function() {
    this.subs.forEach(function(sub) {
        sub.update();
    })
}

var dep = new Dep();
pub.publish();//1, 2, 3