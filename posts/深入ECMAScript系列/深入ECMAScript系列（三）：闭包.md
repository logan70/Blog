# 一、词法作用域

首先我们来看一个例子（来自冴羽大大的博客[JavaScript深入之词法作用域和动态作用域](https://github.com/mqyqingfeng/Blog/issues/3)）：

```js
var scope = 'global scope'
function checkscope(){
    var scope = 'local scope'
    function f(){
        return scope
    }
    return f()
}
checkscope()
```

```js
var scope = 'global scope'
function checkscope(){
    var scope = 'local scope'
    function f(){
        return scope
    }
    return f
}
checkscope()()
```

这里就不卖关子了，两段代码的运行结果都是`local scope`。这是JavaScript**作用域**机制决定的。

> **作用域**：指程序源代码中定义变量的区域。是规定代码对变量访问权限的规则。

大家可能听说过JavaScript采用的是**词法作用域（静态作用域）**，没听说过也没有关系，很好理解，意思就是**函数的作用域在函数定义的时候就确定了**，也就是说**函数的作用域取决于函数在哪里定义，和函数在哪里调用并无关系。**

由之前的文章[深入ECMAScript系列（二）：执行上下文](https://juejin.im/post/5c0d0896e51d4570b57aea2a)我们可知：任意的JavaScript可执行代码（包括函数）被执行时，会**创建新的执行上下文及其词法环境**。既然词法环境是在代码块运行时才创建的，那为什么又说函数的作用域在函数定义的时候就确定了呢？这就牵扯到了函数的声明及调用了。

# 二、函数的声明及调用

在之前的文章[深入ECMAScript系列（二）：执行上下文](https://juejin.im/post/5c0d0896e51d4570b57aea2a)中说过，代码块内的函数声明在**标识符实例化及初始化**阶段就会被初始化并分配相应的函数体，这时候会给函数设置一个内置属性`[[Environment]]`，指向函数声明时所在的执行上下文的词法环境。

当声明过的函数被调用时，会创建新的执行上下文，创建新的词法环境，这个新创建的词法环境的`outer`属性将会指向函数的`[[Environment]]`内置属性，也就是函数声明时所在的执行上下文的词法环境。

总结一下，两个关键点：

1. 函数声明时会被赋予一个内置属性`[[Environment]]`，指向函数声明时所在的执行上下文的词法环境。
2. 函数无论在何时何地调用，创建的词法环境的外部词法环境引用`outer`指向函数的内置属性`[[Environment]]`。

所以说**函数的作用域取决于函数在哪里定义，和函数在哪里调用并无关系。**

我们回头看文章开头的两个例子：

```js
var scope = 'global scope'
function checkscope(){
    var scope = 'local scope'
    function f(){
        return scope
    }
}

// function f
f: {
    [[ECMAScriptCode]]: ..., // 函数体代码
    [[Environment]]: { // 函数f 定义时所在执行上下文的词法环境，也就是函数checkscope运行时创建的词法环境
        EnvironmentRecord: { // 环境记录上绑定了变量scope和函数f
            scope: 'local scope',
            f: Function f
        },
        outer: { // 外部词法环境引用指向全局词法环境
            EnvironmentRecord: { // 全局环境记录上绑定了变量scope和函数checkscope
                scope: 'global scope',
                checkscope: Function checkscope
            },
            outer: null // 全局词法环境无外部词法环境引用
        }
    },
    ... // 其他属性
}
```

函数`f`定义在函数`checkscope`内部，所以函数`f`不论在函数`checkscope`的内部调用，还是作为返回值返回后在外部调用，其词法环境的外部引用永远是函数`checkscope`运行时创建的词法环境，变量`scope`也只用往外寻找一层词法环境，在函数`checkscope`运行时创建的词法环境中找到，值为`'local scope'`，不用再往外查找。所以上面两个例子的运行结果都是`local scope`。

# 三、闭包

首先看看MDN上对**闭包**的定义：

> **闭包**：闭包是函数和声明该函数的词法环境的组合。

**从理论角度来说：所有的JavaScript函数都是闭包。** 因为函数声明时会设置一个内置属性`[[Environment]]`来记录当前执行上下文的词法环境。

**从实践角度来说：** 我们平时所说的闭包应该叫“有意义的闭包”：

在[Dmitry Soshnikov的文章](http://dmitrysoshnikov.com/ecmascript/chapter-6-closures/)中描述具有以下特点的函数叫做闭包：
1. 函数创建时所在的上下文销毁后，该函数仍然存在
2. 函数内引用自由变量

> **自由变量：** 在函数中使用，但既不是函数参数也不是函数的局部变量的变量。

我自己的理解是以下两点：

1. 函数创建时的词法环境已不存在于当前执行上下文的词法环境链上。（换句话说，函数创建时的词法环境内的变量已无法在当前执行上下文内直接访问）
2. 函数内存在对函数创建时的词法环境内的变量的访问。

最简单的闭包就是父函数内返回一个函数，返回函数内引用了父函数内变量：

```js
var scope = 'global scope'
function checkscope(){
    var scope = 'local scope'
    function f(){
        return scope
    }
    return f
}

var closure = checkscope()
closure()
```

将开头的第二个例子稍微变一下，调用`checkscope`会返回一个函数，我们将其赋值给`closure`，此时`closure`函数就是一个**闭包**，由于它是在调用`checkscope`时创建的，内置属性`[[Environment]]`指向调用`checkscope`时创建的词法环境，因此无论在何处调用`closure`函数，返回结果是`'local scope'`。

# 四、闭包的应用

我理解闭包的本质作用就两点，任何闭包的应用都离不开这两点：
1. 创建私有变量
2. 延长变量的生命周期

## 1. 模拟块级作用域

通过闭包可以模拟块级作用域，很经典的例子就是for循环中使用定时器延迟打印的问题。

```js
// ES6之前无块级作用域，多个定时器内的回调函数引用同一个i
// for循环为同步，定时器内函数为异步，循环结束后i已经变为4
// 定时期内函数触发时访问变量i都是4
// 理解的关键在于for循环内代码是同步的，包括setTimtout本身
// 但是setTimeout定时器内的回调函数是异步的
for (var i = 1; i <= 3; i++) {
	setTimeout(function() {
		console.log(i)
	}, i * 1000)
}
```

```js
// 使用立即执行函数，将i作为参数传入，可保存变量i的实时值
for(var i = 1; i <= 3; i++){
    (i => {
        setTimeout(() => {
            console.log(i)
        }, i * 1000)
    })(i)
}
// 以下代码可达到相同效果
for(var i = 1; i <= 3; i++){
    (() => {
        var j = i
        setTimeout(() => {
            console.log(j)
        }, j * 1000)
    })()
}
// 以下代码也可达到相同效果
for(var i = 1; i <= 3; i++){
    var closure = (function() {
        var j = i
        return () => {
            console.log(j)
        }
    })()
    setTimeout(closure, i * 1000)
}
```

闭包模拟块级作用域了解即可，毕竟ES6之后我们有了`let`来实现块级作用域，实现块级作用域的具体原理详见[深入ECMAScript系列（二）：执行上下文](https://juejin.im/post/5c0d0896e51d4570b57aea2a)

## 2. 实现JS模块模式

**模块模式**是指将所有的数据和功能都封装在一个函数内部(私有的),只向外暴露一个包含多个属性方法的对象或函数。

```js
var counter = (function() {
    var privateCounter = 0
    function changeBy(val) {
        privateCounter += val
    }
    return {
        increment: function() {
            changeBy(1)
        },
        decrement: function() {
            changeBy(-1)
        },
        value: function() {
            return privateCounter;
        }
    }
})()
```

另外例如`underscore`等一些js库的实现也使用到了闭包。

```js
(function(){
    var root = this;

    var _ = {};

    root._ = _;
    
    // 外部不可访问的方法
    function tool() {
        // ...
    }
    
    // 外部可访问的方法
    _.xxx = function() {
        tool()
        // ...
    }
})()
```

## 3. 函数的柯里化

柯里化的目的在于避免频繁调用具有相同参数函数的同时，又能够轻松的重用。

```js
// 假设我们有一个求长方形面积的函数
function getArea(width, height) {
    return width * height
}
// 如果我们碰到的长方形的宽老是10
const area1 = getArea(10, 20)
const area2 = getArea(10, 30)
const area3 = getArea(10, 40)

// 我们可以使用闭包柯里化这个计算面积的函数
function getArea(width) {
    return height => {
        return width * height
    }
}

const getTenWidthArea = getArea(10)
// 之后碰到宽度为10的长方形就可以这样计算面积
const area1 = getTenWidthArea(20)

// 而且如果遇到宽度偶尔变化也可以轻松服用
const getTwentyWidthArea = getArea(20)
```

其他例如计数器、延迟调用、回调等闭包的应用这里就不做过多讲解，其核心思想还是**创建私有变量** 和 **延长变量的生命周期**。

# 五、总结

1. ECMAScript采用**词法作用域**（也称静态作用域），函数的作用域取决于函数在哪里定义，和函数在哪里调用并无关系。
2. **闭包**是函数和声明该函数的词法环境的组合。
3. **理论角度来说**所有JavaScript函数都是闭包，因为函数会记录其定义时所处执行上下文的词法环境。
4. **实践角度来说**，引用了定义时所处词法环境的变量，并且能够在除了定义时所在上下文的其他上下文被调用的函数，才叫闭包。
5. 闭包的作用总结为两点，一是**创建私有变量**，二是**延长变量的生命周期**。


# 六、小练习

```js
function fun(n,o){
  console.log(o);
  return {
    fun: function(m){
      return fun(m,n);
    }
  };
}

var a = fun(0);                       // ?
a.fun(1);                             // ?        
a.fun(2);                             // ?
a.fun(3);                             // ?

var b = fun(0).fun(1).fun(2).fun(3);  // ?

var c = fun(0).fun(1);                // ?
c.fun(2);                             // ?
c.fun(3);                             // ?
```

运用我们之前总结的知识来分析一下：

```js
function fun(n,o){
  console.log(o);
  return {
    fun: function(m){
      return fun(m,n);
    }
  };
}

// 运行fun(0)，未传入第二个参数，故打印undefined，最后返回一个对象，内有一个fun方法
// （注意此方法与外部fun函数不同，下同）
var a = fun(0);                       // undefined
// 对象内fun方法为闭包，记录对fun(0)执行时的词法环境，内部绑定一个参数n，值为0
// 将返回对象赋值于a，执行a.fun(x)时，不管传入的第一个参数是什么
// 第二个参数n都将在之前fun(0)执行时的词法环境内找到，值为0
a.fun(1);                             // 0        
a.fun(2);                             // 0
a.fun(3);                             // 0

// 每次调用fun函数都会返回一个对象
// 对象内又一个fun方法，为闭包，记录创建该对象及对象方法时的词法环境
// 故每次调用对象的fun方法，内部执行fun函数时的第二个参数总会在创建该对象时的词法环境内找到
// 值即为创建该对象的函数的第一个参数
// 所以除了第一次打印值为undefined，其余皆为上次调用fun时传入的第一个参数
var b = fun(0).fun(1).fun(2).fun(3);  // undefined
                                      // 0
                                      // 1
                                      // 2

// 类似上面的分析，c为一个对象，有一个fun方法，为闭包
// 该闭包记录了创建它时的词法环境，上面有两个绑定，{n: 1, o: 0}
// 所以c.fun(x)类似调用时，不论传参是什么，都将打印1
// 需要注意fun(0)调用时打印了undefined，fun(0).fun(1)调用时打印了0
var c = fun(0).fun(1);                // undefined
                                      // 0
c.fun(2);                             // 1
c.fun(3);                             // 1
```

OK，本篇文章就写到这里，相信大家对于闭包也有了一定自己的理解。关于深入ECMAScript系列文章之后的主题大家也可以在评论区留言讨论。

# 系列文章

[深入ECMAScript系列目录地址（持续更新中...）](https://github.com/logan70/Blog)

欢迎前往阅读系列文章，如果喜欢或者有所启发，欢迎 star，对作者也是一种鼓励。

菜鸟一枚，如果有疑问或者发现错误，可以在相应的 issues 进行提问或勘误，与大家共同进步。