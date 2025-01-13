
function getShader(gl, id) {
  var shaderScript = document.getElementById(id);
  if (!shaderScript) {
    throw(new Error("No shader element with id: "+id));
  }

  var str = shaderScript.text;

  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    throw(new Error("Unknown shader type "+shaderScript.type));
  }

  gl.shaderSource(shader, str);
  gl.compileShader(shader);

  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) != 1) {
    var ilog = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw(new Error("Failed to compile shader "+shaderScript.id + ", Shader info log: " + ilog));
  }
  return shader;
}
