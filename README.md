# VueTwoWayBinding
## vue双向绑定实现原理
#### 参考链接：https://juejin.im/entry/59116fa6a0bb9f0058aaaa4c
###  vue最核心功能：数据绑定系统 组件系统
### vue双向绑定的技术点
#### 1. defineProperty() 访问器属性 
- 参见definePropertyTest.js 
- Object.defineProperty(obj, prop, descriptor)能够读取属性的值get()和设置属性的值set() 
- get()和set()内部的this都指向obj
- MDN链接：
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
```
var obj = {};
Object.defineProperty(obj, 'hello', {
    get: function() {
        console.log('get function');
    },
    set: function(val) {
        console.log('set %o',val);        
    }
});

obj.hello;
obj.hello = 'abc';

```
#### 2. DocumentFragment 作用：创建文档碎片 将要添加的节点先附加在它上面
- 参见documentFragmentTest.js
- documentFragment()可以看作节点容器 使用它来处理节点 速度和性能会优于直接操作DOM
- MDN链接：https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment

```
var dom = nodeToFragment(document.getElementById('app'));
console.log(dom);

function nodeToFragment(node) {
    var flag = document.createDocumentFragment();
    var child;
    while(child = node.firstChild) {
        flag.appendChild(child);
    }
    return flag;
}

document.getElementById('app').appendChild(dom);
```
#### 3. 订阅发布模式又称观察者模式 
- 参见observerModelTest.js
- 定义了一种一对多的关系 让多的观察者同时监听一个对象  这个对象的状态发生改变时就会通知观察者对象执行相应操作
- 观察者模式是一个对象订阅另一个对象的特定活动并在状态改变后获得通知
- 发出通知 dep.notify() => 触发订阅者的 update 方法 => 更新文本内容

```
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
```

### 将分四个递进讲解

### 1. 简单的双向绑定
- 参见addEventListenerTest.js 
- 监听输入框调用访问器属性defineProperty()设置set()span显示的内容
```
var obj = {};
Object.defineProperty(obj, 'hello', {
    set: function(newVal) {
        document.getElementById('a').value = newVal;
        document.getElementById('b').innerHTML = newVal;
    }
})

document.addEventListener('keyup', function(e) {
    obj.hello = e.target.value;
})

```
### 2.数据初始化绑定
- 参见responsiveDataBinding1.js
- 输入框以及文本节点与 data 中的数据绑定
- vue在进行编译的时候 就是将挂载目标的所有子节点通过appand()添加到documentFragment容器 DOM中的节点将自动删除 经过处理后返回插入挂载目标
- node.nodeType常用的类型：1(元素节点例如<p>) 3(文本) 8(注释) 9(文档) 10(文档类型) 12(符号)

```
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
```

### 3.响应式数据绑定
- 参见responsiveDataBinding2.js
- 输入框内容变化时，data 中的数据同步变化。即 view => model 的变化。
- 修改输入框内容 => 在事件回调函数中修改属性值 => 触发属性的 set 方法
- 将data中的text设置为当前绑定对象的访问器属性
- 当输入框输入值 在defineReactive()中获取输入的值
- 结合上面的监听和docuemntFragment 为当前v-model绑定的节点添加监听 
- 当输入新的值后触发set()将新值赋给相应的data属性  将data的值赋给node
- 这些节点的处理都在documentFragment容器中进行
- 编译完成后将dom返回给app

```
function defineReactive(obj, key, val) {
    console.log('defineReactive  %o', obj);
    Object.defineProperty(obj, key, {
        get: function() {
            console.log('defineProperty get')
            return val;
        },
        set: function(newVal) {
            console.log('set %o', newVal);
            if(newVal === val) return
            val = newVal;
            console.log(val);
        }
    })
}

function observe(obj, vm) {
    console.log('observe');
    Object.keys(obj).forEach(function(key) {
        console.log('observe %o', key)
        defineReactive(vm, key, obj[key]);
    });
}

```

```
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
            node.nodeValue = vm[name];
        }
    }
}
```

### 4.订阅发布模式
- 完整双向绑定参见responsiveDataBinding3.js
- data 中的数据变化时，文本节点的内容同步变化。即 model => view 的变化。
- 每当 new 一个 Vue，主要做了两件事：第一个是监听数据：observe(data)，第二个是编译 HTML：nodeToFragement(id)
- 在监听数据的过程中，会为 data 中的每一个属性生成一个主题对象 dep
- 在编译 HTML 的过程中，会为每个与数据绑定相关的节点生成一个订阅者 watcher，watcher 会将自己添加到相应属性的 dep 中

```
function Watcher(vm, node, name) {
    Dep.target = this;
    this.name = name;
    this.node = node;
    this.vm = vm;
    this.update();
    Dep.target = null;
}

```

```
Watcher.prototype = {
    update: function() {
        this.get();
        this.node.nodeValue = this.value;
    },
    get: function() {
        this.value = this.vm[this.name];
    }
}
```
