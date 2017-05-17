function defineReactive(obj, key, val) {
    console.log('defineReactive  %o', obj);
    var dep = new Dep();
    Object.defineProperty(obj, key, {
        get: function() {
            console.log('defineProperty get')
            if(Dep.target) dep.addSub(Dep.target);
            return val;
        },
        set: function(newVal) {
            console.log('set %o', newVal);
            val = newVal;
            dep.notify();
            console.log(val);
        }
    })
}

function Dep() {
    this.subs = [];
}

Dep.prototype = {
    addSub: function(sub) {
        this.subs.push(sub);
    },
    notify: function() {
        this.subs.forEach(function(sub) {
            sub.update();
        })
    }
}

function observe(obj, vm) {
    console.log('observe');
    Object.keys(obj).forEach(function(key) {
        console.log('observe %o', key)
        defineReactive(vm, key, obj[key]);
    });
}

function Watcher(vm, node, name) {
    Dep.target = this;
    this.name = name;
    this.node = node;
    this.vm = vm;
    this.update();
    Dep.target = null;
}

Watcher.prototype = {
    update: function() {
        this.get();
        this.node.nodeValue = this.value;
    },
    get: function() {
        this.value = this.vm[this.name];
    }
}

function compile(node, vm) {
    console.log('compile');
    var reg = /\{\{(.*)\}\}/;
    if(node.nodeType === 1) {
        var attr = node.attributes;
        for(var i = 0; i < attr.length; i++) {
            if(attr[i].nodeName == 'v-model') {
                var name = attr[i].nodeValue;
                node.addEventListener('input', function(e) {
                    vm[name] = e.target.value;
                })
                node.value = vm[name];
                node.removeAttribute('v-model');
            }
        }
    }
    if(node.nodeType === 3) {
        if(reg.test(node.nodeValue)) {
            var name = RegExp.$1;
            name = name.trim();
            // node.nodeValue = vm[name];
            new Watcher(vm, node, name);
        }
    }
}

function nodeToFragment(node, vm) {
    console.log('nodeToFragment %o', node);
    var flag = document.createDocumentFragment();
    var child ;
    while(child = node.firstChild) {
        compile(child, vm);
        flag.append(child);
    }
    return flag;
}

function Vue(options) {
    console.log('vue');
    this.data = options.data;
    var data = this.data;
    console.log('vue %o', data);
    observe(data, this);
    var id = options.el;
    var dom = nodeToFragment(document.getElementById(id), this);
    document.getElementById(id).appendChild(dom);
}

var vm = new Vue({
    el: 'app',
    data: {
        text: 'hello world'
    }
});
