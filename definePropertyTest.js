/**
 * 访问器属性defineProperty() 读取对象属性为其赋值
 */
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
