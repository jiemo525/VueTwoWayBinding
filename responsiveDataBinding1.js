function compile(node, vm) {
    var reg = /\{\{(.*)\}\}/;
    if(node.nodeType === 1) {//节点类型为元素
        var attr = node.attributes;
        for(var i = 0; i < attr.length; i++) {
            if(attr[i].nodeName == 'v-model') {
                var name = attr[i].nodeValue;//获取v-model绑定的属性名
                node.value = vm.data[name];//将data的值赋给node
                node.removeAttribute('v-model');
            }
        };
    }
    if(node.nodeType === 3) {//节点类型为text
        if(reg.test(node.nodeValue)) {
            var name = RegExp.$1;
            name = name.trim();
            node.nodeValue = vm.data[name];
        }
    }
}

function nodeToFragment(node, vm) {
    var flag = document.createDocumentFragment();
    var child ;
    while(child = node.firstChild) {
        compile(child, vm);
        flag.append(child);//将子节点放到容器中
    }
    return flag;
}

function Vue(options) {
    this.data = options.data;
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
