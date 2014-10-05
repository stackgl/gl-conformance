gl-conformance
==============
A port of the Khronos ARB WebGL conformance test suite to CommonJS and tape, so that it can be run without a browser.

# Example usage

To use the test suite, you pass it a reference to tape and whatever function you are going to use to create WebGL contexts:

```javascript
require('gl-conformance')({
  tape: require('tape'),
  createContext: function(width, height, options) {
    //Replace this with a function that constructs your WebGL context
    var canvas    = document.createElement('canvas')
    canvas.width  = width
    canvas.height = height
    var context   = canvas.getContext('webgl', opts)
    return context
  }
})
```

Then it will churn away at all the Khronos/ARB test cases and report the output to stdout as one would expect tap/tape to do.

# Installation

```
npm install gl-conformance
```

# API

### `require('gl-conformance')(environment)`
Runs the WebGL conformance suite within the given environment.  `environment` is an object with the following properties:

* `tape` a refernce to a [`tape` object](https://www.npmjs.org/package/tape)
* `createContext(width,height,opts)` a function which creates a WebGL context from the given parameters

# License
Conformance tests are (c) Khronos ARB

CommonJS port by Mikola Lysenko