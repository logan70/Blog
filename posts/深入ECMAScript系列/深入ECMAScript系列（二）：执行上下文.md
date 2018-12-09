# 一、执行上下文（Exexution Contexts）

> 执行上下文（Exexution Contexts）：用来通过ECMAScript编译器来追踪代码运行时计算的一种规范策略。

**执行上下文**简单理解就是代码执行时所在环境的抽象。

执行上下文同时包含**变量环境组件（VariableEnvironment）**和**词法环境组件（LexicalEnvironment）**，这两个组件多数情况下都指向相同的**词法环境（Lexical Environment）**，那为什么还要存在两个环境组件呢？我们稍后将进行详细讨论。如果不太了解词法环境的可以看下我的上一篇文章[深入ECMAScript系列（一）：词法环境](https://juejin.im/post/5c0a398be51d451dcb0400b3)。

```js
ExecutionContext = {
    VariableEnvironment: { ... },
    LexicalEnvironment: { ... },
}
```

# 二、执行上下文栈

**执行上下文栈（Execution Context Stack）**：是一个后进先出的栈式结构（LIFO），用来跟踪维护执行上下文。**运行执行上下文（running execution context）** 始终位于执行上下文栈的顶层。那么什么时候会创建新的执行上下文呢？

ECMAScript可执行代码有四种类型：**全局代码，函数代码，模块代码和`eval`**。每当从当前执行代码运行至其他可执行代码时，会创建新的执行上下文，将其压入执行上下文栈并成为正在运行的执行上下文。当相关代码执行完毕返回后，将正在运行的执行上下文从执行上下文栈删除，之前的执行上下文又成为了正在运行的执行上下文。

我们通过一个动图来看一下执行上下文栈的工作过程

![](https://user-gold-cdn.xitu.io/2018/11/26/1674fb1c6c5ed955?w=894&h=422&f=gif&s=3918869)

1. 开始执行任何JavaScript代码前，会创建全局上下文并压入栈，所以全局上下文一直在栈底。
2. 每次调用函数都会创建新的执行上下文（即便在函数内部调用自身），并压入栈。
3. 函数执行完毕返回，其执行上下文出栈。
4. 所有代码运行完毕，执行上下文栈只剩全局执行上下文。

# 三、执行上下文的创建、入栈及出栈

上面提到过ECMAScript可执行代码有四种类型：**全局代码，函数代码，模块代码和`eval`**。

> 这里虽然说是**全局代码**，但是JavaScript引擎其实是按照`script`标签来解析执行的，也就是说`script`标签按照它们出现的顺序解析执行，这也就是为什么我们平时要将项目依赖js库放在前面引入的原因。

JavaScript引擎是按可执行代码块来执行代码的，在任意的JavaScript可执行代码被执行时，执行步骤可按如下理解：

1. 创建一个**新的执行上下文（Execution Context）**
2.  创建一个**新的词法环境（Lexical Environment）**
2. 设置该执行上下文的**变量环境组件（VariableEnvironment）**和**词法环境组件（LexicalEnvironment）**
3. 将该执行上下文**推入执行上下文栈**并成为**正在运行的执行上下文**
4. 对代码块内的**标识符进行实例化及初始化**
5. **运行代码**
6. 运行完毕后**执行上下文出栈**

## 变量提升（Hoisting）及暂时性死区（temporal dead zone，TDZ）

我们平常所说的**变量提升**就发生在上述执行步骤的**第四步**，对代码块内的**标识符进行实例化及初始化**的具体表现如下：

1. 执行代码块内的`let`、`const`和`class`声明的标识符合集记录为`lexNames`
2. 执行代码块内的`var`和`function`声明的标识符合集记录为`varNames`
3. 如果`lexNames`内的任何标识符在`varNames`或`lexNames`内出现过，则报错`SyntaxError`
    >这就是为什么可以用`var`或`function`声明多个同名变量，但是不能用`let`、`const`和`class`声明多个同名变量。
4. 将`varNames`内的`var`声明的标识符实例化并初始化赋值`undefined`，如果有同名标识符则跳过
    >这就是所谓的**变量提升**，我们用`var`声明的变量，在声明位置之前访问并不会报错，而是返回`undefined`
5. 将`lexNames`内的标识符实例化，但并不会进行初始化，在运行至其声明处代码时才会进行初始化，在初始化前访问都会报错。
    > 这就是我们所说的**暂时性死区**，`let`、`const`和`class`声明的变量其实也提升了，只不过没有被初始化，初始化之前不可访问。
6. 最后将`varNames`内的函数声明实例化并初始化赋值对应的函数体，如果有同名函数声明，则前面的都会忽略，只有最后一个声明的函数会被初始化赋值。
    > 函数声明会被直接赋值，所有我们在函数声明位置之前也可以调用函数。

# 四、为什么需要两个环境组件

首先明确这两个环境组件的作用，`变量环境组件（VariableEnvironment）`用于记录`var`声明的绑定，`词法环境组件（LexicalEnvironment）`用于记录其他声明的绑定（如`let`、`const`、`class`等）。

一般情况下一个`Exexution Contexts`内的`VariableEnvironment`和`LexicalEnvironment`指向同一个词法环境，之所以要区分两个组件，主要是为了**实现块级作用域的同时不影响`var`声明及函数声明**。

众所周知，ES6之前并没有**块级作用域**的概念，但是ES6及之后我们可以通过新增的`let`及`const`等命令来实现块级作用域，并且不影响`var`声明的变量和函数声明，那么这是怎么实现的呢？

1. 首先在一个正在运行的执行上下文（`running Execution Context`）内，词法环境由`VariableEnvironment`和`LexicalEnvironment`构成，此执行上下文内的所有标识符的绑定都记录在两个组件的环境记录内。
2. 当运行至块级代码时，会将`LexicalEnvironment`记录下来，我们将其记录为`oldEnv`。
3. 然后创建一个新的`LexicalEnvironment`（外部词法环境`outer`指向`oldEnv`），我们将其记录为`newEnv`，并将`newEnv`设置为`running Execution Context`的`LexicalEnvironment`。
4. 然后块级代码内的`let`、`const`等声明就会绑定在这个`newEnv`上面，但是`var`声明和函数声明还是绑定在原来的`VariableEnvironment`上面。
    > 块级代码内的函数声明会被当做`var`声明，会被提升至外部环境，块级代码运行前其值为初始值`undefined`
    ```js
    console.log(foo) // 输出：undefined
    {
        function foo() {console.log('hello')}
    }
    console.log(foo) // 输出: ƒ foo() {console.log('hello')}
    ```
5. 块级代码运行完毕后，又将`oldEnv`还原为`running Execution Context`的`LexicalEnvironment`。

目前包括块级代码（在一对大括号内的代码）、`for`循环语句、`switch`语句、`TryCatch`语句中的`catch`从句以及`with`语句（`with`语句创建的新环境为对象式环境，其他皆为声明式环境）都是这样来实现块级作用域的。

# 系列文章

准备将之前写的部分深入ECMAScript文章重写，加深自己理解，使内容更有干货，目录结构也更合理。

[深入ECMAScript系列目录地址（持续更新中...）](https://github.com/logan70/Blog)

欢迎前往阅读系列文章，如果喜欢或者有所启发，欢迎 star，对作者也是一种鼓励。

菜鸟一枚，如果有疑问或者发现错误，可以在相应的 issues 进行提问或勘误，与大家共同进步。