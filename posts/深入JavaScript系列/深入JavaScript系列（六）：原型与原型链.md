说到JavaScript的原型和原型链，相关文章已有不少，但是大都晦涩难懂。本文将换一个角度出发，先理解原型和原型链是什么，有什么作用，再去分析那些令人头疼的关系。

# 一、引用类型皆为对象

原型和原型链都是来源于对象而服务于对象的概念，所以我们要先明确一点：

**JavaScript中一切引用类型都是对象，对象就是属性的集合。**

`Array类型`、`Function类型`、`Object类型`、`Date类型`、`RegExp类型`等都是引用类型。

也就是说 **数组是对象、函数是对象、正则是对象、对象还是对象。**

![](https://user-gold-cdn.xitu.io/2018/11/9/166f6326edc99c76?w=435&h=184&f=png&s=17467)

# 二、原型和原型链是什么

上面我们说到对象就是属性（property）的集合，有人可能要问不是还有方法吗？其实方法也是一种属性，因为它也是`键值对`的表现形式，具体见下图。

![](https://user-gold-cdn.xitu.io/2018/11/9/166f64bf36e55099?w=347&h=182&f=png&s=30826)

可以看到`obj`上确实多了一个`sayHello`的属性，值为一个函数，但是问题来了，`obj`上面并没有`hasOwnProperty`这个方法，为什么我们可以调用呢？这就引出了 **原型**。

每一个对象从被创建开始就和另一个对象关联，从另一个对象上继承其属性，这个`另一个对象`就是 **原型**。

当访问一个对象的属性时，先在对象的本身找，找不到就去对象的原型上找，如果还是找不到，就去对象的原型（原型也是对象，也有它自己的原型）的原型上找，如此继续，直到找到为止，或者查找到最顶层的原型对象中也没有找到，就结束查找，返回`undefined`。

**这条由对象及其原型组成的链就叫做原型链。**

现在我们已经初步理解了原型和原型链，到现在大家明白为什么数组都可以使用`push`、`slice`等方法，函数可以使用`call`、`bind`等方法了吧，因为在它们的原型链上找到了对应的方法。

OK，**总结一下**：

1. **原型存在的意义就是组成原型链**：引用类型皆对象，每个对象都有原型，原型也是对象，也有它自己的原型，一层一层，组成原型链。
2. **原型链存在的意义就是继承**：访问对象属性时，在对象本身找不到，就在原型链上一层一层找。说白了就是一个对象可以访问其他对象的属性。
3. **继承存在的意义就是属性共享**：好处有二：一是代码重用，字面意思；二是可扩展，不同对象可能继承相同的属性，也可以定义只属于自己的属性。

# 三、创建对象

对象的创建方式主要有两种，一种是`new`操作符后跟函数调用，另一种是字面量表示法。

目前我们现在可以理解为：所有对象都是由`new`操作符后跟函数调用来创建的，字面量表示法只是语法糖（即本质也是`new`，功能不变，使用更简洁）。

```js
// new操作符后跟函数调用
let obj = new Object()
let arr = new Array()

// 字面量表示法
let obj = { a: 1}
// 等同于
let obj = new Object()
obj.a = 1

let arr = [1,2]
// 等同于
let arr = new Array()
arr[0] = 1
arr[1] = 2
```

`Object`、`Array`等称为构造函数，不要怕这个概念，构造函数和普通函数并没有什么不同，只是由于这些函数常被用来跟在`new`后面创建对象。`new`后面调用一个空函数也会返回一个对象，**任何一个函数都可以当做构造函数**。

所以构造函数更合理的理解应该是`函数的构造调用`。

`Number`、`String`、`Boolean`、`Array`、`Object`、`Function`、`Date`、`RegExp`、`Error`这些都是函数，而且是原生构造函数，在运行时会自动出现在执行环境中。

构造函数是为了创建特定类型的对象，这些通过同一构造函数创建的对象有相同原型，共享某些方法。举个例子，所有的数组都可以调用`push`方法，因为它们有相同原型。

我们来自己实现一个构造函数：

```js
// 惯例，构造函数应以大写字母开头
function Person(name) {
  // 函数内this指向构造的对象
  // 构造一个name属性
  this.name = name
  // 构造一个sayName方法
  this.sayName = function() {
    console.log(this.name)
  }
}

// 使用自定义构造函数Person创建对象
let person = new Person('logan')
person.sayName() // 输出：logan
```

**总结一下**：**构造函数用来创建对象，同一构造函数创建的对象，其原型相同。**

# 四、`__proto__`与`prototype`

万物逃不开真香定律，初步了解了相关知识，我们也要试着来理解一下这些头疼的单词，并且看一下指来指去的箭头了。

上面总结过，每个对象都有原型，那么我们怎么获取到一个对象的原型呢？那就是对象的`__proto__`属性，指向对象的原型。

上面也总结过，引用类型皆对象，所以引用类型都有`__proto__`属性，对象有`__proto__`属性，函数有`__proto__`属性，数组也有`__proto__`属性，只要是引用类型，就有`__proto__`属性，都指向它们各自的原型对象。

![](https://user-gold-cdn.xitu.io/2018/11/9/166f828b681072eb?w=599&h=274&f=png&s=21131)

`__proto__`属性虽然在ECMAScript 6语言规范中标准化，但是不推荐被使用，现在更推荐使用`Object.getPrototypeOf`，`Object.getPrototypeOf(obj)`也可以获取到`obj`对象的原型。本文中使用`__proto__`只是为了便于理解。

```js
Object.getPrototypeOf(person) === person.__proto__ // true
```

上面说过，构造函数是为了创建特定类型的对象，那如果我想让`Person`这个构造函数创建的对象都共享一个方法，总不能像下面这样吧：

**错误示范**

```js
// 调用构造函数Person创建一个新对象personA
let personA = new Person('张三')
// 在personA的原型上添加一个方法，以供之后Person创建的对象所共享
personA.__proto__.eat = function() {
    console.log('吃东西')
}
let personB = new Person('李四')
personB.eat() // 输出：吃东西
```

但是每次要修改一类对象的原型对象，都去创建一个新的对象实例，然后访问其原型对象并添加or修改属性总觉得多此一举。既然构造函数创建的对象实例的原型对象都是同一个，那么构造函数和其构造出的对象实例的原型对象之间有联系就完美了。

![](https://user-gold-cdn.xitu.io/2018/11/9/166f82804842244b?w=602&h=291&f=png&s=22608)

这个联系就是`prototype`。每个函数拥有`prototype`属性，指向使用`new`操作符和该函数创建的对象实例的原型对象。

```js
Person.prototype === person.__proto__ // true
```

![](https://user-gold-cdn.xitu.io/2018/11/9/166f829f2814bb9a?w=631&h=286&f=png&s=24769)

看到这里我们就明白了，如果想让`Person`创建出的对象实例共享属性，应该这样写：

**正确示范**

```js
Person.prototype.drink = function() {
    console.log('喝东西')
}

let personA = new Person('张三')
personB.drink() // 输出：喝东西
```

OK，惯例，**总结一下**：

1. 对象有`__proto__`属性，函数有`__proto__`属性，数组也有`__proto__`属性，只要是引用类型，就有`__proto__`属性，指向其原型。
2. 只有函数有`prototype`属性，只有函数有`prototype`属性，只有函数有`prototype`属性，指向`new`操作符加调用该函数创建的对象实例的原型对象。

# 五、原型链顶层

原型链之所以叫原型链，而不叫原型环，说明它是有始有终的，那么原型链的顶层是什么呢？

拿我们的`person`对象来看，它的原型对象，很简单

```js
// 1. person的原型对象
person.__proto__ === Person.prototype
```

接着往上找，`Person.prototype`也是一个普通对象，可以理解为`Object`构造函数创建的，所以得出下面结论，

```js
// 2. Person.prototype的原型对象
Person.prototype.__proto__ === Object.prototype
```

`Object.prototype`也是一个对象，那么它的原型呢？这里比较特殊，切记！！！

```js
Object.prototype.__proto__ === null
```

我们就可以换个方式描述下 **原型链** ：由对象的`__proto__`属性串连起来的直到`Object.prototype.__proto__`（为`null`）的链就是原型链。

在上面内容的基础之上，我们来模拟一下js引擎读取对象属性：

```js
function getProperty(obj, propName) {
    // 在对象本身查找
    if (obj.hasOwnProperty(propName)) {
        return obj[propName]
    } else if (obj.__proto__ !== null) {
    // 如果对象有原型，则在原型上递归查找
        return getProperty(obj.__proto__, propName)
    } else {
    // 直到找到Object.prototype，Object.prototype.__proto__为null，返回undefined
        return undefined
    }
}
```

# 六、`constructor`

回忆一下之前的描述，构造函数都有一个`prototype`属性，指向使用这个构造函数创建的对象实例的**原型对象**。

这个**原型对象**中默认有一个`constructor`属性，指回该构造函数。

```js
Person.prototype.constructor === Person // true
```

之所以开头不说，是因为这个属性对我们理解原型及原型链并无太大帮助，反而容易混淆。


![](https://user-gold-cdn.xitu.io/2018/11/9/166f83af5e67ebcf?w=625&h=288&f=png&s=26149)

# 七、函数对象的原型链

之前提到过引用类型皆对象，函数也是对象，那么函数对象的原型链是怎么样的呢？

对象都是被构造函数创建的，函数对象的构造函数就是`Function`，注意这里`F`是大写。

```js
let fn = function() {}
// 函数（包括原生构造函数）的原型对象为Function.prototype
fn.__proto__ === Function.prototype // true
Array.__proto__ === Function.prototype // true
Object.__proto__ === Function.prototype // true
```

`Function.prototype`也是一个普通对象，所以`Function.prototype.__proto__ === Object.prototype`

这里有一个特例，`Function`的`__proto__`属性指向`Function.prototype`。

**总结一下：函数都是由`Function`原生构造函数创建的，所以函数的`__proto__`属性指向`Function`的`prototype`属性**

# 八、小试牛刀

真香警告！

![](https://user-gold-cdn.xitu.io/2018/11/9/166f859ad7cc4b0b?w=488&h=590&f=png&s=151684)

有点乱？没事，我们先将之前的知识都总结一下，然后慢慢分析此图：

**知识点**

1. 引用类型都是对象，每个对象都有原型对象。
2. 对象都是由构造函数创建，对象的`__proto__`属性指向其原型对象，构造函数的`prototype`属性指向其创建的对象实例的原型对象，所以对象的`__proto__`属性等于创建它的构造函数的`prototype`属性。
3. 所有通过字面量表示法创建的普通对象的构造函数为`Object`
4. 所有原型对象都是普通对象，构造函数为`Object`
5. 所有函数的构造函数是`Function`
6. `Object.prototype`没有原型对象

OK，我们根据以上六点总结来分析上图，先从左上角的`f1`、`f2`入手：

```js
// f1、f2都是通过new Foo()创建的对象，构造函数为Foo，所以有
f1.__proto__ === Foo.prototype
// Foo.prototype为普通对象，构造函数为Object，所以有
Foo.prototype.__proto === Object.prototype
// Object.prototype没有原型对象
Object.prototype.__proto__ === null
```

然后对构造函数`Foo`下手：

```js
// Foo是个函数对象，构造函数为Function
Foo.__proto__ === Function.prototype
// Function.prototype为普通对象，构造函数为Object，所以有
Function.prototype.__proto__ === Object.prototype
```

接着对原生构造函数`Object`创建的`o1`、`o2`下手：

```js
// o1、o2构造函数为Object
o1.__proto__ === Object.prototype
```

最后对原生构造函数`Object`和`Function`下手：

```js
// 原生构造函数也是函数对象，其构造函数为Function
Object.__proto__ === Function.prototype
// 特例
Function.__proto__ === Function.prototype
```

分析完毕，也没有想象中那么复杂是吧。

如果有内容引起不适，建议从头看一遍，或者去看看参考文章内的文章。

# 九、举一反三

## 1. `instanceof`操作符

平常我们判断一个变量的类型会使用`typeof`运算符，但是引用类型并不适用，除了函数对象会返回`function`外，其他都返回`object`。我们想要知道一个对象的具体类型，就需要使用到`instanceof`。

```js
let fn = function() {}
let arr = []
fn instanceof Function // true
arr instanceof Array // true
fn instanceof Object // true
arr instanceof Object // true
```

为什么`fn instanceof Object`和`arr instanceof Object`都返回`true`呢？我们来看一下MDN上对于`instanceof`运算符的描述：

> instanceof运算符用于测试构造函数的prototype属性是否出现在对象的原型链中的任何位置

也就是说`instanceof`操作符左边是一个对象，右边是一个构造函数，在左边对象的原型链上查找，知道找到右边构造函数的prototype属性就返回`true`，或者查找到顶层`null`（也就是`Object.prototype.__proto__`），就返回`false`。
我们模拟实现一下：

```js
function instanceOf(obj, Constructor) { // obj 表示左边的对象，Constructor表示右边的构造函数
    let rightP = Constructor.prototype // 取构造函数显示原型
    let leftP = obj.__proto__ // 取对象隐式原型
    // 到达原型链顶层还未找到则返回false
    if (leftP === null) {
        return false
    }
    // 对象实例的隐式原型等于构造函数显示原型则返回true
    if (leftP === rightP) {
        return true
    }
    // 查找原型链上一层
    return instanceOf(obj.__proto__, Constructor)
}
```

现在就可以解释一些比较令人费解的结果了：

```js
fn instanceof Object //true
// 1. fn.__proto__ === Function.prototype
// 2. fn.__proto__.__proto__ === Function.prototype.__proto__ === Object.prototype
arr instanceof Object //true
// 1. arr.__proto__ === Array.prototype
// 2. arr.__proto__.__proto__ === Array.prototype.__proto__ === Object.prototype
Object instanceof Object // true
// 1. Object.__proto__ === Function.prototype
// 2. Object.__proto__.__proto__ === Function.prototype.__proto__ === Object.prototype
Function instanceof Function // true
// Function.__proto__ === Function.prototype
```

**总结一下：`instanceof`运算符用于检查右边构造函数的`prototype`属性是否出现在左边对象的原型链中的任何位置。其实它表示的是一种原型链继承的关系。**

## 2. `Object.create`

之前说对象的创建方式主要有两种，一种是`new`操作符后跟函数调用，另一种是字面量表示法。

其实还有第三种就是ES5提供的`Object.create()`方法，会创建一个新对象，第一个参数接收一个对象，将会作为新创建对象的原型对象，第二个可选参数是属性描述符（不常用，默认是`undefined`）。具体请查看[Object.create()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/create)。

我们来模拟一个简易版的`Object.create`：

```js
function createObj(proto) {
    function F() {}
    F.prototype = proto
    return new F()
}
```

我们平常所说的空对象，其实并不是严格意义上的空对象，它的原型对象指向`Object.prototype`，还可以继承`hasOwnProperty`、`toString`、`valueOf`等方法。

如果想要生成一个不继承任何属性的对象，可以使用`Object.create(null)`。

如果想要生成一个平常字面量方法生成的对象，需要将其原型对象指向`Object.prototype`：

```js
let obj = Object.create(Object.prototype)
// 等价于
let obj = {}
```

## 3. `new`操作符

当我们使用`new`时，做了些什么？

1. 创建一个全新对象，并将其`__proto__`属性指向构造函数的`prototype`属性。
2. 将构造函数调用的this指向这个新对象，并执行构造函数。
3. 如果构造函数返回对象类型Object(包含Functoin, Array, Date, RegExg, Error等)，则正常返回，否则返回这个新的对象。

依然来模拟实现一下：

```js
function newOperator(func, ...args) {
    if (typeof func !== 'function') {
        console.error('第一个参数必须为函数，您传入的参数为', func)
        return
    }
    // 创建一个全新对象，并将其`__proto__`属性指向构造函数的`prototype`属性
    let newObj = Object.create(func.prototype)
    // 将构造函数调用的this指向这个新对象，并执行构造函数
    let result = func.apply(newObj, args)
    // 如果构造函数返回对象类型Object，则正常返回，否则返回这个新的对象
    return (result instanceof Object) ? result : newObj
}
```


## 4. `Function.__proto__ === Function.prototype`

其实这里完全没必要去纠结鸡生蛋还是蛋生鸡的问题，我自己的理解是：`Function`是原生构造函数，自动出现在运行环境中，所以不存在自己生成自己。之所以`Function.__proto__ === Function.prototype`，是为了表明`Function`作为一个原生构造函数，本身也是一个函数对象，仅此而已。

## 5. 真的是继承吗？

前面我们讲到每一个对象都会从原型“继承”属性，实际上，继承是一个十分具有迷惑性的说法，引用《你不知道的JavaScript》中的话，就是：

继承意味着复制操作，然而 JavaScript 默认并不会复制对象的属性，相反，JavaScript 只是在两个对象之间创建一个关联，这样，一个对象就可以通过委托访问另一个对象的属性，所以与其叫继承，委托的说法反而更准确些。

# 十、参考文章

> [深入理解javascript原型和闭包（完结）- 王福朋](http://www.cnblogs.com/wangfupeng1988/p/3977924.html) <br>
> [JavaScript深入之从原型到原型链](https://github.com/mqyqingfeng/Blog/issues/2)


# 系列文章

[深入ECMAScript系列目录地址（持续更新中...）](https://github.com/logan70/Blog)

欢迎前往阅读系列文章，如果喜欢或者有所启发，欢迎 star，对作者也是一种鼓励。

菜鸟一枚，如果有疑问或者发现错误，可以在相应的 issues 进行提问或勘误，与大家共同进步。