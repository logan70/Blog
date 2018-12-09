# 一、词法环境 （Lexical Environment）

> **ECMAScript规范中对词法环境的描述如下**：词法环境是用来定义 基于词法嵌套结构的ECMAScript代码内的标识符与变量值和函数值之间的关联关系 的一种规范类型。一个词法环境由环境记录（Environment Record）和一个可能为`null`的对外部词法环境的引用（outer）组成。一般来说，词法环境都与特定的ECMAScript代码语法结构相关联，例如函数、代码块、`TryCatch`中的`Catch`从句，并且每次执行这类代码时都会创建新的词法环境。


简而言之，**词法环境**就是相应代码块内**标识符与值的关联关系**的体现。如果之前了解过**作用域**概念的话，和**词法环境**是类似的（ES6之后**作用域**概念变为**词法环境**概念）。

词法环境有两个组成部分：

1. **环境记录（Environment Record）**：记录相应代码块的标识符绑定。
    >可以理解为相应代码块内的所有变量声明、函数声明（代码块若为函数还包括其形参）都储存于此<br>
    >对应ES6之前的变量对象or活动对象，没了解过的可忽略

2. **对外部词法环境的引用（outer）**：用于形成多个词法环境在逻辑上的嵌套结构，以实现可以访问外部词法环境变量的能力。
    > 词法环境在逻辑上的嵌套结构对应ES6之前的作用域链，没了解过的可忽略

# 二、环境记录（Environment Record）

环境记录有三种类型，分别是**声明式环境记录（Declarative Environment Record）**、**对象式环境记录（Object Environment Record）**、**全局环境记录（Global Environment Record）**。

## 1. 声明式环境记录（Declarative Environment Record）

声明式环境记录是用来定义那些直接将标识符与语言值绑定的ES语法元素，例如变量，常量，let，class，module，import以及函数声明等。

声明式环境记录有函数环境记录（Function Environment Record）和模块环境记录（Module Environment Record）两种特殊类型。

### 1.1 函数环境记录（Function Environment Record）

函数环境记录用于体现一个函数的顶级作用域，如果函数不是箭头函数，还会提供一个`this`的绑定。

### 1.2 模块环境记录（Module Environment Record）

模块环境记录用于体现一个模块的外部作用域（即模块export所在环境），除了正常绑定外，也提供了所有引入的其他模块的绑定（即import的所有模块，这些绑定只读），因此我们可以直接访问引入的模块。

## 2. 对象式环境记录（Object Environment Record）

每个对象式环境记录都与一个对象相关联，这个对象叫做对象式环境记录的`binding object`。可以理解为对象式环境记录就是基于这个`binding object`，以对象属性的形式进行标识符绑定，标识符与`binding object`的属性名一一对应。

是对象就可以动态添加或者删除属性，所以对象环境记录不存在不可变绑定。

对象式环境记录用来定义那些将标识符与某些对象属性相绑定的ES语法元素，例如with语句、全局var声明和函数声明。

## 3. 全局环境记录（Global Environment Record）

全局环境记录逻辑上来说是单个记录，但是实际上可以看作是对一个`对象式环境记录`组件和一个`声明式环境记录`组件的封装。

之前说过每个`对象式环境记录`都有一个`binding object`，全局环境记录的`对象式环境记录`的`binding object`就是全局对象，在浏览器内，全局的`this`及`window`绑定都指向全局对象。

全局环境记录的`对象式环境记录`组件，绑定了所有内置全局属性、全局的函数声明以及全局的`var`声明。

所以这些绑定我们可以通过`window.xx`或`this.xx`获取到。

![](https://user-gold-cdn.xitu.io/2018/11/21/167363d5608c5c01?w=354&h=333&f=png&s=33333)

全局代码的其他声明（如**let、const、class**等）则绑定在`声明式环境记录`组件内，由于`声明式环境记录`组件并不是基于简单的对象形式来实现绑定，所以这些声明我们并**不能通过全局对象的属性来访问**。

![](https://user-gold-cdn.xitu.io/2018/11/22/16739197e1e523ab?w=281&h=411&f=png&s=33369)

# 三、 外部词法环境的引用（outer）

首先要说明两点：
1. 全局环境的外部词法环境引用为`null`。
2. 一个词法环境可以作为多个词法环境的外部环境。例如全局声明了多个函数，则这些函数词法环境的外部词法环境引用都指向全局环境。

外部词法环境的引用将一个词法环境和其外部词法环境链接起来，外部词法环境又拥有对其自身的外部词法环境的引用。这样就形成一个链式结构，这里我们称其为**环境链**（即ES6之前的作用域链），全局环境是这条链的顶端。

环境链的存在是为了标识符的解析，通俗的说就是查找变量。首先在当前环境查找变量，找不到就去外部环境找，还找不到就去外部环境的外部环境找，以此类推，直到找到，或者到环境链顶端（全局环境）还未找到则抛出`ReferenceError`。

**标识符解析**：在环境链中解析变量（绑定）的过程，

我们使用伪代码来模拟一下标识符解析的过程。

```js
ResolveBinding(name[, LexicalEnvironment]) {
    // 如果传入词法环境为null(即一直解析到全局环境还未找到变量)，则抛出ReferenceError
    if (LexicalEnvironment === null) {
        throw ReferenceError(`${name} is not defined`)
    }
    // 首次查找，将当前词法环境设置为解析环境
    if (typeof LexicalEnvironment === 'undefined') {
        LexicalEnvironment = currentLexicalEnvironment
    }
    // 检查环境的环境记录中是否有此绑定
    let isExist = LexicalEnvironment.EnviromentRecord.HasBinding(name)
    // 如果有则返回绑定值，没有则去外层环境查找
    if （isExist） {
        return LexicalEnvironment.EnviromentRecord[name]
    } else {
        return ResolveBinding(name, LexicalEnvironment.outer)
    }
}
```

# 四、案例分析

上面讲了那么多理论知识，现在我们结合代码来复习，有以下全局代码：

```js
var x = 10
let y = 20
const z = 30
class Person {}
function foo() {
    var a = 10
}
foo()
```

现在我们有了一个全局词法环境和foo函数词法环境（**以下内容均为抽象伪代码**）：

```js
// 全局词法环境
GlobalEnvironment = {
    outer: null, // 全局环境的外部环境引用为null
    // 全局环境记录，抽象为一个声明式环境记录和一个对象式环境记录的封装
    GlobalEnvironmentRecord: {
        // 全局this绑定值指向全局对象，即ObjectEnvironmentRecord的binding object
        [[GlobalThisValue]]: ObjectEnvironmentRecord[[BindingObject]],
        // 声明式环境记录，全局除了函数和var，其他声明绑定于此
        DeclarativeEnvironmentRecord: {
            y: 20,
            z: 30,
            Person: <<class>>
        },
        // 对象式环境记录的，绑定对象为全局对象，故其中的绑定可以通过访问全局对象的属性来获得
        ObjectEnvironmentRecord: {
            // 全局函数声明和var声明
            x: 10,
            foo: <<function>>,
            // 内置全局属性
            isNaN: <<function>>,
            isFinite: <<function>>,
            parseInt: <<function>>,
            parseFloat: <<function>>,
            Array: <<construct function>>,
            Object: <<construct function>>
            // 其他内置全局属性不一一列举
        }
    }
}

// foo函数词法环境
fooFunctionEnviroment = {
    outer: GlobalEnvironment, // 外部词法环境引用指向全局环境
    FunctionEnvironmentRecord: {
        [[ThisValue]]: GlobalEnvironment, // foo函数全局调用，故this绑定指向全局环境
        // 其他函数代码内的绑定
        a: 10
    }
}
```

# 五、全局标识符解析

由于全局环境记录是声明式环境记录和对象式环境记录的封装，所以全局标识符的解析与其他环境的标识符解析有所不同，下面介绍全局标识符解析的步骤（伪代码）：

```js
function GetGlobalBingingValue(name) {
    // 全局环境记录
    let rec = Global Environment Record
    // 全局环境记录的声明式环境记录
    let DecRec = rec.DeclarativeRecord
    // HasBinding用来检查环境记录上是否绑定给定标识符
    if (DecRec.HasBinding(name) === true) {
        return DecRec[name]
    }
    let ObjRec = rec.ObjectRecord
    if (ObjRec.HasBinding(name) === true) {
        return ObjRec[name]
    }
    throw ReferenceError(`${name} is not defined`)
}
```

可以看到读取全局变量时，先检索声明式环境记录，再检索对象式环境记录。这样就会出现一些有趣的现象：

`let`、`const`、`class`等声明的变量如果存在同名`var`变量或同名函数声明，就会报错（之后的文章中会具体介绍）。但是如果我们使用`let`、`const`、`class`声明变量，然后直接通过给全局对象添加一个同名属性，则可以绕过此类报错。

此时全局环境记录的声明式环境记录和对象式环境记录内都有此标识符的绑定，但是我们访问时由于先检索声明式环境记录，所以对象式环境记录内的绑定会被遮蔽，要想访问只能通过访问全局对象属性的方法访问。

![](https://user-gold-cdn.xitu.io/2018/12/7/16787e234698c0b4?w=502&h=166&f=png&s=26165)

# 系列文章

准备将之前写的部分深入ECMAScript文章重写，加深自己理解，使内容更有干货，目录结构也更合理。

[深入ECMAScript系列目录地址（持续更新中...）](https://github.com/logan70/Blog)

欢迎前往阅读系列文章，如果喜欢或者有所启发，欢迎 star，对作者也是一种鼓励。

菜鸟一枚，如果有疑问或者发现错误，可以在相应的 issues 进行提问或勘误，与大家共同进步。