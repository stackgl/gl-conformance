'use strict'

module.exports = buildShims

const fs = require('fs');
const path = require('path');

/**
 * Reads the replacement functions from a file.
 * @param {string} replacementsCode - replacement functions.
 * @returns {object} - An object where keys are function names and values are their new implementations.
 */
function loadReplacements(replacementsCode) {
  const replacements = {};

  // Extract functions defined as "var name = function".
  replacementsCode.replace(/var\s+(\w+)\s*=\s*function\s*\([^)]*\)\s*[\s\S]*?(?=\n\};?)\n\};?[^\n]*\n/g, (match, functionName) => {
    replacements[functionName] = match;
  });

  // Extract functions defined as "function name"
  replacementsCode.replace(/function\s+(\w+)\s*\([^)]*\)\s*[\s\S]*?(?=\n\};?)\n\};?[^\n]*\n/g, (match, functionName) => {
    replacements[functionName] = match;
  });

  return replacements;
}

/**
 * Replaces functions in the source code with the provided replacements.
 * @param {string} sourceCode - The original source code.
 * @param {object} replacements - An object containing function name to implementation mappings.
 * @returns {string} - The modified source code.
 */
function replaceFunctionsInSource(sourceCode, replacements) {
  return sourceCode.replace(
    /var\s+(\w+)\s*=\s*\(?function\([^\)]*\)\s+[\s\S]*?(?=\n\};?)\n\};?[^\n]*\n/g,
    (match, functionName) => {
      if (replacements[functionName]) {
        console.log(`Replacing function: ${functionName}`);
        return replacements[functionName];
      }
      return match; // Keep the original function if no replacement is found.
    }
  ).replace(
    /function\s+(\w+)\([^\)]*\)\s+[\s\S]*?(?=\n\};?)\n\};?[^\n]*\n/g,
    (match, functionName) => {
      if (replacements[functionName]) {
        console.log(`Replacing function: ${functionName}`);
        return replacements[functionName];
      }
      return match; // Keep the original function if no replacement is found.
    }
  ).replace(/\n\(function\s*\(\)[\s\S]*?(?=\n\})\n\}[^\n]*\n/, "");
}

function extractContentBeforeFirstFunction(replacementsCode) {
  const regex = /^[\s\S]*?^.*\s(?=[^\r\n]*function)/m;
  const match = replacementsCode.match(regex);

  if (match) {
    const contentBeforeFunction = match[0];
    return contentBeforeFunction;
  }

  // If no "function" line is found, return the entire content
  return replacementsCode;
}

/**
 * Main function to process the JavaScript file.
 * @param {string} inputFilePath - Path to the input JavaScript file.
 * @param {string} replacementsFilePath - Path to the file containing replacement functions.
 * @param {string} outputFilePath - Path to save the modified JavaScript file.
 */
function processFile(inputFilePath, replacementsFilePath, outputFilePath) {
  try {
    let sourceCode = fs.readFileSync(inputFilePath, 'utf-8');

    if (fs.existsSync(replacementsFilePath)) {
      const replacementsCode = fs.readFileSync(replacementsFilePath, 'utf-8');
      const replacements = loadReplacements(replacementsCode);

      const beforeFirstFunction = extractContentBeforeFirstFunction(replacementsCode);

      sourceCode = replaceFunctionsInSource(sourceCode, replacements);

      const TOP_MARKER = `*/`

      sourceCode = sourceCode.replace(TOP_MARKER, `${TOP_MARKER}\n${beforeFirstFunction}`);
    }

    fs.writeFileSync(outputFilePath, sourceCode, 'utf-8');
    console.log(`File processed and saved to ${outputFilePath}`);
  } catch (error) {
    console.error('Error processing file:', error);
  }
}

function buildShims(suiteDir) {
  var RESOURCES = require('./shims.json')
  Object.keys(RESOURCES).forEach(function (resName) {
    var resource = RESOURCES[resName]
    var inputFilePath = path.join(suiteDir, resName)
    var outputFilePath = path.join(__dirname, resource.path)
    var replacementsFilePath = path.join(__dirname, 'shims', `${path.basename(resource.path, '.js')}-funcs.js`)
    processFile(inputFilePath, replacementsFilePath, outputFilePath)
  })

}