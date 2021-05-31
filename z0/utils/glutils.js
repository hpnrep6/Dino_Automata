import * as VAR from '../var.js';

export function createShaderProgram(gl, vertexScript, fragScript) {
    const vs = compileShader(gl, gl.VERTEX_SHADER, vertexScript);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragScript);

    const program = gl.createProgram();

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log('Error initialising shader program: ' + gl.getShaderInfoLog(program));
        return null;
    }

    return program;
}


export function compileShader(gl, type, script) {
    var shader = gl.createShader(type);

    gl.shaderSource(shader, script);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log('Error compiling shader: ' + gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

export function loadSpriteTexture(gl, url) {
    var texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 0, 255]);

    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, type, pixel);

    const image = new Image();
    image.src = url;

    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, type, image);
    };

    return {
        texture: texture,
        image: image
    };
}

export function loadSpriteTextureFromImage(gl, image) {
    var texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    const level = 0;
    const internalFormat = gl.RGBA;
    const srcFormat = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;

    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, type, image);

    // if(VAR.glVersion == VAR.WEBGL_2) gl.generateMipmap(gl.TEXTURE_2D);

    return texture;
}