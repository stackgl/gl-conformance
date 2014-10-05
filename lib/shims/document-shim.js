module.exports = createFakeDOM

function FakeDOM(environment) {
  this.__ENV = environment
}

var proto = FakeDOM.prototype

function scanList(list, id) {
  for(var i=0; i<list.length; ++i) {
    if(list[i].id === id) {
      return list[i]
    }
  }
  return null
}

FakeDOM.getElementById = function(id) {
  return scanList(this.__ENV.canvasList, id) ||
         scanList(this.__ENV.scriptList, id)
}

function createFakeDOM(environment) {
  return new FakeDOM(environment)
}