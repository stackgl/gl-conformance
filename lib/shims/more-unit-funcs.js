var CONSOLE = (1,eval)("console")
var __testLog__ = {
  appendChild: ()=>{}
}

function runTests() {
  // var h = document.getElementById('test-status');
  // if (h == null) {
  //   h = document.createElement('h1');
  //   h.id = 'test-status';
  //   document.body.appendChild(h);
  // }
  // h.textContent = "";
  // var log = document.getElementById('test-log');
  // if (log == null) {
  //   log = document.createElement('div');
  //   log.id = 'test-log';
  //   document.body.appendChild(log);
  // }
  // while (log.childNodes.length > 0)
  //   log.removeChild(log.firstChild);

  var setup_args = [];

  if (Tests.startUnit != null) {
    // __testLog__ = document.createElement('div');
    try {
      setup_args = Tests.startUnit();
      // if (__testLog__.childNodes.length > 0)
      //   log.appendChild(__testLog__);
    } catch(e) {
      testFailed("startUnit", formatError(e));
      // log.appendChild(__testLog__);
      printTestStatus();
      return;
    }
  }

  var testsRun = false;
  var allTestsSuccessful = true;

  for (var i in Tests) {
    if (i.substring(0,4) != "test") continue;
    // __testLog__ = document.createElement('div');
    __testSuccess__ = true;
    try {
      doTestNotify (i);
      var args = setup_args;
      if (Tests.setup != null)
        args = Tests.setup.apply(Tests, setup_args);
      Tests[i].apply(Tests, args);
      if (Tests.teardown != null)
        Tests.teardown.apply(Tests, args);
    }
    catch (e) {
      testFailed(i, e.name, formatError(e));
    }
    if (__testSuccess__ == false) {
      ++__testFailCount__;
    }
    // var h = document.createElement('h2');
    // h.textContent = i;
    // __testLog__.insertBefore(h, __testLog__.firstChild);
    // log.appendChild(__testLog__);
    allTestsSuccessful = allTestsSuccessful && __testSuccess__ == true;
    reportTestResultsToHarness(__testSuccess__, i);
    doTestNotify (i+"--"+(__testSuccess__?"OK":"FAIL"));
    testsRun = true;
  }

  printTestStatus(testsRun);
  if (Tests.endUnit != null) {
    // __testLog__ = document.createElement('div');
    try {
      Tests.endUnit.apply(Tests, setup_args);
      // if (__testLog__.childNodes.length > 0)
      //   log.appendChild(__testLog__);
    } catch(e) {
      testFailed("endUnit", e.name, formatError(e));
      // log.appendChild(__testLog__);
    }
  }
  notifyFinishedToHarness(allTestsSuccessful, "finished tests");
}

function formatError(e) {
  CONSOLE.error(e)
}

function testFailed(assertName, name) {
  ENVIRONMENT.tape.fail(assertName + " -- " + name)
}

function testPassed(assertName, name) {
  ENVIRONMENT.tape.pass(assertName + " -- " + name)
}

function log(msg) {
  CONSOLE.log(msg)
}

function printTestStatus(testsRun) {
  CONSOLE.log("STATUS", testsRun ? "OK" : "FAIL")
}

function time(elementId, f) {
  var t0 = Date.now()
  f();
  var t1 = Date.now()
  CONSOLE.log("Elapsed time:", (t1-t0), "ms")
}

function reportTestResultsToHarness(success, msg) {
  // ENVIRONMENT.tape.end()
}
 
function notifyFinishedToHarness() {
   ENVIRONMENT.tape.end()
}
 
function initTests() {
  if (Tests.message != null) {
    CONSOLE.log(Tests.message)
  }
  runTests();
}
