gl-conformance
==============
A port of the Khronos ARB WebGL conformance test suite to CommonJS and tape, so that it can be run without a browser or from within browserify easily.

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
    var context   = canvas.getContext('webgl', options)
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
* `filter(caseName)` an optional filter which returns `true` if the case `caseName` should be run

# Building the test suite

If you are installing from npm, you can ignore this section.  Otherwise, for users who are building the project from github, you need to do the following:


### 1. Install dependencies

```
npm install
```

### 2. Run the build script

```
npm run-script build
```

### 3. Run the test (uses browser WebGL context)

```
npm test
```

### 4. Publish

```
npm publish
```

# License
Conformance tests are (c) Khronos ARB

CommonJS port by Mikola Lysenko
