# nodejs-executor

## 注意点

包名为`node-executor`，但是 bin 文件为 `nodejs-executor`。

### 日志的使用
logger 使用 winston，不能像 console.log 一样使用。

logger 只有第一个参数是文本，后面的参数需要传入键值对的 object，如果是一个变量，会直接被忽略。
error 日志，第一个 error 参数是 message 参数，第二个才可以传递 error 对象。
可以参考 test 文件夹中的 logger.test.ts 文件。