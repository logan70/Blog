# 一、函数的调用

> 全局环境的this指向全局对象，在浏览器中就是我们熟知的window对象

说到`this`的种种情况，就离不开函数的调用，一般我们调用函数，无外乎以下四种方式：
1. 普通调用，例如`foo()`。
2. 作为对象方法调用，例如`obj.foo()`。
3. 构造函数调用，例如`new foo()`。
4. 使用`call`、`apply`、`bind`等方法。

除箭头函数外的其他函数被调用时，会在其词法环境上绑定`this`的值，我们可以通过一些方法来指定`this`的值。

1. 使用`call`、`apply`、`bind`等方法来显式指定`this`的值。
    ```js
    function foo() {
        console.log(this.a)
    }
    foo.call({a: 1}) // 输出： 1
    foo.apply({a: 2}) // 输出： 2
    // bind方法返回一个函数，需要手动进行调用
    foo.bind({a: 3})() // 输出： 3
    ```
2. 当函数作为对象的方法调用时，`this`的值将被隐式指定为这个对象。
    ```js
    let obj = {
        a: 4,
        foo: function() {
            console.log(this.a)
        }
    }
    obj.foo() // 输出： 4
    ```
3. 当函数配合`new`操作符作为构造函数调用时，`this`的值将被隐式指定新构造出来的对象。

# 二、ECMAScript规范解读this

上面讲了几种比较容易记忆和理解`this`的情况，我们来根据ECMAScript规范来简单分析一下，这里只说重点，一些规范内具体的实现就不讲了，反而容易混淆。

其实当我们调用函数时，内部是调用函数的一个**内置`[[Call]](thisArgument, argumentsList)`方法**，此方法接收两个参数，第一个参数提供`this`的绑定值，第二个参数就是函数的参数列表。

> **ECMAScript规范：** 严格模式时，函数内的`this`绑定严格指向传入的`thisArgument`。非严格模式时，若传入的`thisArgument`不为`undefined`或`null`时，函数内的`this`绑定指向传入的`thisArgument`；为`undefined`或`null`时，函数内的`this`绑定指向全局的`this`。

所以第一点中讲的三种情况都是显式或隐式的传入了`thisArgument`来作为`this`的绑定值。我们来用伪代码模拟一下：

```js
function foo() {
    console.log(this.a)
}

/* -------显式指定this------- */
foo.call({a: 1})
foo.apply({a: 1})
foo.bind({a: 1})()
// 内部均执行
foo[[Call]]({a: 1})

/* -------函数构造调用------- */
new foo()
// 内部执行
let obj = {}
obj.__proto__ = foo.prototype
foo[[Call]](obj)
// 最后将这个obj返回，关于构造函数的详细内容可翻阅我之前关于原型和原型链的文章

/* -------作为对象方法调用------- */
let obj = {
    a: 4,
    foo: function() {
        console.log(this.a)
    }
}
obj.foo()
// 内部执行
foo[[Call]]({
    a: 1,
    foo: Function foo
})
```

那么当函数普通调用时，`thisArgument`的值并没有传入，即为`undefined`，根据上面的**ECMAScript规范**，若非严格模式，函数内`this`指向全局`this`，在浏览器内就是window。

伪代码模拟：

```js
window.a = 10
function foo() {
    console.log(this.a)
}
foo() // 输出： 10
foo.call(undefined) // 输出： 10
// 内部均执行
foo[[Call]](undefined) // 非严格模式，this指向全局对象

foo.call(null) // 输出： 10
// 内部执行
foo[[Call]](null) // 非严格模式，this指向全局对象
```

根据上面的**ECMAScript规范**，严格模式下，函数内的`this`绑定严格指向传入的`thisArgument`。所以有以下表现。

```js
function foo() {
    'use strict'
    console.log(this)
}
foo() // 输出：undefined
foo.call(null) // 输出：null
```

需要注意的是，这里所说的严格模式是函数被创建时是否为严格模式，并非函数被调用时是否为严格模式：

```js
window.a = 10
function foo() {
    console.log(this.a)
}
function bar() {
    'use strict'
    foo()
}
bar() // 输出：10
```

# 三、箭头函数中的this

**ES6新增的箭头函数在被调用时不会绑定`this`**，所以它需要去词法环境链上寻找`this`。

```js
function foo() {
    return () => {
        console.log(this)
    }
}
const arrowFn1 = foo()
arrowFn1() // 输出：window
           // 箭头函数没有this绑定，往外层词法环境寻找
           // 在foo的词法环境上找到this绑定，指向全局对象window
           // 在foo的词法环境上找到，并非是在全局找到的
const arrowFn2 = foo.call({a: 1})
arrowFn2() // 输出 {a: 1}
```

切记，箭头函数中不会绑定`this`，由于JS采用词法作用域，所以箭头函数中的`this`只取决于其定义时的环境。

```js
window.a = 10
const foo = () => {
    console.log(this.a)
}
foo.call({a: 20}) // 输出： 10

let obj = {
    a: 20,
    foo: foo
}
obj.foo() // 输出： 10

function bar() {
    foo()
}
bar.call({a: 20}) // 输出： 10
```

# 四、回调函数中的this

当函数作为回调函数时会产生一些怪异的现象：

```js
window.a = 10
let obj = {
    a: 20,
    foo: function() {
        console.log(this.a)
    }
}

setTimeout(obj.foo, 0) // 输出： 10
```

我觉得这么解释比较好理解：`obj.foo`作为回调函数，我们其实在传递函数的具体值，而并非函数名，也就是说回调函数会记录传入的函数的函数体，达到触发条件后进行执行，伪代码如下:

```js
setTimeout(obj.foo, 0)
//等同于，先将传入回调函数记录下来
let callback = obj.foo
// 达到触发条件后执行回调
callback()
// 所以foo函数并非作为对象方法调用，而是作为函数普通调用
```

要想避免这种情况，有三种方法，第一种方法是使用`bind`返回的指定好`this`绑定的函数作为回调函数传入：

```js
setTimeout(obj.foo.bind({a: 20}), 0) // 输出： 20
```

第二种方法是储存我们想要的this值，就是常见的，具体命名视个人习惯而定。

```js
let _this = this
let self = this
let me = this
```

第三种方法就是使用箭头函数

```js
window.a = 10
function foo() {
    return () => {
        console.log(this.a)
    }
}
const arrowFn = foo.call({a: 20})
arrowFn() // 输出：20
setTimeout(arrowFn, 0) // 输出：20
```

# 五、总结

1. 箭头函数中没有`this`绑定，`this`的值取决于其创建时所在词法环境链中最近的`this`绑定
2. 非严格模式下，函数普通调用，`this`指向全局对象
3. 严格模式下，函数普通调用，`this`为`undefined`
4. 函数作为对象方法调用，`this`指向该对象
5. 函数作为构造函数配合`new`调用，`this`指向构造出的新对象
6. 非严格模式下，函数通过`call`、`apply`、`bind`等间接调用，`this`指向传入的第一个参数
    > 这里注意两点：<br>
    > 1. `bind`返回一个函数，需要手动调用，`call`、`apply`会自动调用<br>
    > 2. 传入的第一个参数若为`undefined`或`null`，`this`指向全局对象
7. 严格模式下函数通过`call`、`apply`、`bind`等间接调用，`this`严格指向传入的第一个参数

有时候文字的表述是苍白无力的，真正理解之后会发现：`this`不过如此。

# 六、小练习

```js
window.a = 'global'
function foo() {
    console.log(this.a)
}

let obj = {
    a: 'obj',
    foo,
    bar() {
        console.log(this.a)
        foo()
        this.foo()
        ;(function() {
            console.log(this.a)
        })()
    }
}

obj.bar() // ?

setTimeout(obj.bar, 0) // ?
```

答案就不放了，大家可自己在控制台试试。

# 系列文章

[深入ECMAScript系列目录地址（持续更新中...）](https://github.com/logan70/Blog)

欢迎前往阅读系列文章，如果喜欢或者有所启发，欢迎 star，对作者也是一种鼓励。

菜鸟一枚，如果有疑问或者发现错误，可以在相应的 issues 进行提问或勘误，与大家共同进步。