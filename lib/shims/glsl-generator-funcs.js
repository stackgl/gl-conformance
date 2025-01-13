function _reportResults(refData, refImg, testData, testImg, tolerance,
                        width, height, ctx, imgData, wtu, canvas2d, consoleDiv) {
  var same = true;
  var firstFailure = null;
  for (var yy = 0; yy < height; ++yy) {
    for (var xx = 0; xx < width; ++xx) {
      var offset = (yy * width + xx) * 4;
      var imgOffset = ((height - yy - 1) * width + xx) * 4;
      imgData.data[imgOffset + 0] = 0;
      imgData.data[imgOffset + 1] = 0;
      imgData.data[imgOffset + 2] = 0;
      imgData.data[imgOffset + 3] = 255;
      if (Math.abs(refData[offset + 0] - testData[offset + 0]) > tolerance ||
          Math.abs(refData[offset + 1] - testData[offset + 1]) > tolerance ||
          Math.abs(refData[offset + 2] - testData[offset + 2]) > tolerance ||
          Math.abs(refData[offset + 3] - testData[offset + 3]) > tolerance) {
        var detail = 'at (' + xx + ',' + yy + '): ref=(' +
            refData[offset + 0] + ',' +
            refData[offset + 1] + ',' +
            refData[offset + 2] + ',' +
            refData[offset + 3] + ')  test=(' +
            testData[offset + 0] + ',' +
            testData[offset + 1] + ',' +
            testData[offset + 2] + ',' +
            testData[offset + 3] + ') tolerance=' + tolerance;
        // consoleDiv.appendChild(document.createTextNode(detail));
        // consoleDiv.appendChild(document.createElement('br'));
        if (!firstFailure) {
          firstFailure = ": " + detail;
        }
        imgData.data[imgOffset] = 255;
        same = false;
      }
    }
  }

  var diffImg = null;
  if (!same) {
    ctx.putImageData(imgData, 0, 0);
    diffImg = wtu.makeImageFromCanvas(canvas2d);
  }

  // var div = document.createElement("div");
  // div.className = "testimages";
  // wtu.insertImage(div, "ref", refImg);
  // wtu.insertImage(div, "test", testImg);
  // if (diffImg) {
  //   wtu.insertImage(div, "diff", diffImg);
  // }
  // div.appendChild(document.createElement('br'));

  // consoleDiv.appendChild(div);

  if (!same) {
    testFailed("images are different" + (firstFailure ? firstFailure : ""));
  } else {
    testPassed("images are the same");
  }

  // consoleDiv.appendChild(document.createElement('hr'));
}
