# VueTwoWayBinding
## vue双向绑定实现原理
### 1.  vue最核心功能：数据绑定系统 组件系统
### 2.  vue双向绑定的技术点
- defineProperty() 访问器属性 
- DocumentFragment 作用：创建文档碎片 将要添加的节点先附加在它上面 
- 订阅发布模式又称观察者模式 定义了一种一对多的关系 让多的观察者同时监听一个对象  这个对象的状态发生改变时就会通知观察者对象执行相应操作
### 将分四个递进讲解
### 1. 访问器属性
- 参见definePropertyTest.js 
-  Object.defineProperty(obj, prop, descriptor)能够读取属性的值get()和设置属性的值set() 
-  get()和set()内部的this都指向obj
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
### 2. 简单的双向绑定
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
### 3.数据初始化绑定
- 参见documentFragmentTest.js
- 将data.text显示在输入框和文本节点中
- documentFragment()可以看作节点容器 使用它来处理节点 速度和性能会优于直接操作DOM
- MDN链接：https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment
- vue在进行编译的时候 就是将挂载目标的所有子节点通过appand()添加到documentFragment容器 DOM中的节点将自动删除 经过处理后返回插入挂载目标
- node.nodeType常用的类型：1(元素节点例如<p>) 3(文本) 8(注释) 9(文档) 10(文档类型) 12(符号)
### 4.响应式数据绑定
- 参见responsiveDataBinding.js
- 修改输入框内容 => 在事件回调函数中修改属性值 => 触发属性的 set 方法
- 将data中的text设置为当前绑定对象的访问器属性
- 当输入框输入值 在defineReactive()中获取输入的值
- 结合上面的监听和docuemntFragment 为当前v-model绑定的节点添加监听 
- 当输入新的值后触发set()将新值赋给相应的data属性  将data的值赋给node
- 这些节点的处理都在documentFragment容器中进行
- 编译完成后将dom返回给app
### 4.订阅发布模式
- 参见completeTest.js
- 发出通知 dep.notify() => 触发订阅者的 update 方法 => 更新文本内容
- 每当 new 一个 Vue，主要做了两件事：第一个是监听数据：observe(data)，第二个是编译 HTML：nodeToFragement(id)
- 在监听数据的过程中，会为 data 中的每一个属性生成一个主题对象 dep
- 在编译 HTML 的过程中，会为每个与数据绑定相关的节点生成一个订阅者 watcher，watcher 会将自己添加到相应属性的 dep 中