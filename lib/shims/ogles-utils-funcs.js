function compareResults(expected, actual) {
  var width = expected.width;
  var height = expected.height;
  var imgData = {
    width: expected.width,
    height: expected.height,
    data: new Uint8Array(4*width*height)
  }
  var tolerance = 0;

  var expData = expected.pixels;
  var actData = actual.pixels;

  var same = compareImages(expData, actData, width, height, imgData.data);

  if (!same) {
    testFailed("images are different");
  } else {
    testPassed("images are the same");
  }
}
