var CONSOLE = (1,eval)("console")
var successfullyParsed = true

function testPassed(msg)
{
    ENVIRONMENT.tape.pass(msg)
}

function testFailed(msg)
{
    ENVIRONMENT.tape.fail(msg)
}

function notifyFinishedToHarness() {
  ENVIRONMENT.postHook = function () {
    ENVIRONMENT.tape.end()
  }
}

function description(msg)
{
    CONSOLE.log("DESCRIPTION:", msg)
}

function debug(msg)
{
    CONSOLE.log("DEBUG:", msg)
}

function _addSpan(contents)
{
}

function finishTest() {
  ENVIRONMENT.tape.end()
}
