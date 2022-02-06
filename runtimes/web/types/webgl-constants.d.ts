/**
 * The following defined constants and descriptions are directly ported from https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants
 *
 * Any copyright is dedicated to the Public Domain. http://creativecommons.org/publicdomain/zero/1.0/
 *
 * Contributors
 *
 * See: https://developer.mozilla.org/en-US/profiles/Sheppy
 * See: https://developer.mozilla.org/en-US/profiles/fscholz
 * See: https://developer.mozilla.org/en-US/profiles/AtiX
 * See: https://developer.mozilla.org/en-US/profiles/Sebastianz
 *
 * These constants are defined on the WebGLRenderingContext / WebGL2RenderingContext interface
 */
/**
 * Passed to clear to clear the current depth buffer
 * @constant {number}
 */
export declare const DEPTH_BUFFER_BIT = 256;
/**
 * Passed to clear to clear the current stencil buffer
 * @constant {number}
 */
export declare const STENCIL_BUFFER_BIT = 1024;
/**
 * Passed to clear to clear the current color buffer
 * @constant {number}
 */
export declare const COLOR_BUFFER_BIT = 16384;
/**
 * Passed to drawElements or drawArrays to draw single points
 * @constant {number}
 */
export declare const POINTS = 0;
/**
 * Passed to drawElements or drawArrays to draw lines. Each vertex connects to the one after it
 * @constant {number}
 */
export declare const LINES = 1;
/**
 * Passed to drawElements or drawArrays to draw lines. Each set of two vertices is treated as a separate line segment
 * @constant {number}
 */
export declare const LINE_LOOP = 2;
/**
 * Passed to drawElements or drawArrays to draw a connected group of line segments from the first vertex to the last
 * @constant {number}
 */
export declare const LINE_STRIP = 3;
/**
 * Passed to drawElements or drawArrays to draw triangles. Each set of three vertices creates a separate triangle
 * @constant {number}
 */
export declare const TRIANGLES = 4;
/**
 * Passed to drawElements or drawArrays to draw a connected group of triangles
 * @constant {number}
 */
export declare const TRIANGLE_STRIP = 5;
/**
 * Passed to drawElements or drawArrays to draw a connected group of triangles. Each vertex connects to the previous and the first vertex in the fan
 * @constant {number}
 */
export declare const TRIANGLE_FAN = 6;
/**
 * Passed to blendFunc or blendFuncSeparate to turn off a component
 * @constant {number}
 */
export declare const ZERO = 0;
/**
 * Passed to blendFunc or blendFuncSeparate to turn on a component
 * @constant {number}
 */
export declare const ONE = 1;
/**
 * Passed to blendFunc or blendFuncSeparate to multiply a component by the source elements color
 * @constant {number}
 */
export declare const SRC_COLOR = 768;
/**
 * Passed to blendFunc or blendFuncSeparate to multiply a component by one minus the source elements color
 * @constant {number}
 */
export declare const ONE_MINUS_SRC_COLOR = 769;
/**
 * Passed to blendFunc or blendFuncSeparate to multiply a component by the source's alpha
 * @constant {number}
 */
export declare const SRC_ALPHA = 770;
/**
 * Passed to blendFunc or blendFuncSeparate to multiply a component by one minus the source's alpha
 * @constant {number}
 */
export declare const ONE_MINUS_SRC_ALPHA = 771;
/**
 * Passed to blendFunc or blendFuncSeparate to multiply a component by the destination's alpha
 * @constant {number}
 */
export declare const DST_ALPHA = 772;
/**
 * Passed to blendFunc or blendFuncSeparate to multiply a component by one minus the destination's alpha
 * @constant {number}
 */
export declare const ONE_MINUS_DST_ALPHA = 773;
/**
 * Passed to blendFunc or blendFuncSeparate to multiply a component by the destination's color
 * @constant {number}
 */
export declare const DST_COLOR = 774;
/**
 * Passed to blendFunc or blendFuncSeparate to multiply a component by one minus the destination's color
 * @constant {number}
 */
export declare const ONE_MINUS_DST_COLOR = 775;
/**
 * Passed to blendFunc or blendFuncSeparate to multiply a component by the minimum of source's alpha or one minus the destination's alpha
 * @constant {number}
 */
export declare const SRC_ALPHA_SATURATE = 776;
/**
 * Passed to blendFunc or blendFuncSeparate to specify a constant color blend function
 * @constant {number}
 */
export declare const CONSTANT_COLOR = 32769;
/**
 * Passed to blendFunc or blendFuncSeparate to specify one minus a constant color blend function
 * @constant {number}
 */
export declare const ONE_MINUS_CONSTANT_COLOR = 32770;
/**
 * Passed to blendFunc or blendFuncSeparate to specify a constant alpha blend function
 * @constant {number}
 */
export declare const CONSTANT_ALPHA = 32771;
/**
 * Passed to blendFunc or blendFuncSeparate to specify one minus a constant alpha blend function
 * @constant {number}
 */
export declare const ONE_MINUS_CONSTANT_ALPHA = 32772;
/**
 * Passed to blendEquation or blendEquationSeparate to set an addition blend function
 * @constant {number}
 */
export declare const FUNC_ADD = 32774;
/**
 * Passed to blendEquation or blendEquationSeparate to specify a subtraction blend function (source - destination)
 * @constant {number}
 */
export declare const FUNC_SUBSTRACT = 32778;
/**
 * Passed to blendEquation or blendEquationSeparate to specify a reverse subtraction blend function (destination - source)
 * @constant {number}
 */
export declare const FUNC_REVERSE_SUBTRACT = 32779;
/**
 * Passed to getParameter to get the current RGB blend function
 * @constant {number}
 */
export declare const BLEND_EQUATION = 32777;
/**
 * Passed to getParameter to get the current RGB blend function. Same as BLEND_EQUATION
 * @constant {number}
 */
export declare const BLEND_EQUATION_RGB = 32777;
/**
 * Passed to getParameter to get the current alpha blend function. Same as BLEND_EQUATION
 * @constant {number}
 */
export declare const BLEND_EQUATION_ALPHA = 34877;
/**
 * Passed to getParameter to get the current destination RGB blend function
 * @constant {number}
 */
export declare const BLEND_DST_RGB = 32968;
/**
 * Passed to getParameter to get the current source RGB blend function
 * @constant {number}
 */
export declare const BLEND_SRC_RGB = 32969;
/**
 * Passed to getParameter to get the current destination alpha blend function
 * @constant {number}
 */
export declare const BLEND_DST_ALPHA = 32970;
/**
 * Passed to getParameter to get the current source alpha blend function
 * @constant {number}
 */
export declare const BLEND_SRC_ALPHA = 32971;
/**
 * Passed to getParameter to return a the current blend color
 * @constant {number}
 */
export declare const BLEND_COLOR = 32773;
/**
 * Passed to getParameter to get the array buffer binding
 * @constant {number}
 */
export declare const ARRAY_BUFFER_BINDING = 34964;
/**
 * Passed to getParameter to get the current element array buffer
 * @constant {number}
 */
export declare const ELEMENT_ARRAY_BUFFER_BINDING = 34965;
/**
 * Passed to getParameter to get the current lineWidth (set by the lineWidth method)
 * @constant {number}
 */
export declare const LINE_WIDTH = 2849;
/**
 * Passed to getParameter to get the current size of a point drawn with gl.POINTS
 * @constant {number}
 */
export declare const ALIASED_POINT_SIZE_RANGE = 33901;
/**
 * Passed to getParameter to get the range of available widths for a line. Returns a length-2 array with the lo value at 0, and hight at 1
 * @constant {number}
 */
export declare const ALIASED_LINE_WIDTH_RANGE = 33902;
/**
 * Passed to getParameter to get the current value of cullFace. Should return FRONT, BACK, or FRONT_AND_BACK
 * @constant {number}
 */
export declare const CULL_FACE_MODE = 2885;
/**
 * Passed to getParameter to determine the current value of frontFace. Should return CW or CCW
 * @constant {number}
 */
export declare const FRONT_FACE = 2886;
/**
 * Passed to getParameter to return a length-2 array of floats giving the current depth range
 * @constant {number}
 */
export declare const DEPTH_RANGE = 2928;
/**
 * Passed to getParameter to determine if the depth write mask is enabled
 * @constant {number}
 */
export declare const DEPTH_WRITEMASK = 2930;
/**
 * Passed to getParameter to determine the current depth clear value
 * @constant {number}
 */
export declare const DEPTH_CLEAR_VALUE = 2931;
/**
 * Passed to getParameter to get the current depth function. Returns NEVER, ALWAYS, LESS, EQUAL, LEQUAL, GREATER, GEQUAL, or NOTEQUAL
 * @constant {number}
 */
export declare const DEPTH_FUNC = 2932;
/**
 * Passed to getParameter to get the value the stencil will be cleared to
 * @constant {number}
 */
export declare const STENCIL_CLEAR_VALUE = 2961;
/**
 * Passed to getParameter to get the current stencil function. Returns NEVER, ALWAYS, LESS, EQUAL, LEQUAL, GREATER, GEQUAL, or NOTEQUAL
 * @constant {number}
 */
export declare const STENCIL_FUNC = 2962;
/**
 * Passed to getParameter to get the current stencil fail function. Should return KEEP, REPLACE, INCR, DECR, INVERT, INCR_WRAP, or DECR_WRAP
 * @constant {number}
 */
export declare const STENCIL_FAIL = 2964;
/**
 * Passed to getParameter to get the current stencil fail function should the depth buffer test fail. Should return KEEP, REPLACE, INCR, DECR, INVERT, INCR_WRAP, or DECR_WRAP
 * @constant {number}
 */
export declare const STENCIL_PASS_DEPTH_FAIL = 2965;
/**
 * Passed to getParameter to get the current stencil fail function should the depth buffer test pass. Should return KEEP, REPLACE, INCR, DECR, INVERT, INCR_WRAP, or DECR_WRAP
 * @constant {number}
 */
export declare const STENCIL_PASS_DEPTH_PASS = 2966;
/**
 * Passed to getParameter to get the reference value used for stencil tests
 * @constant {number}
 */
export declare const STENCIL_REF = 2967;
/**
 * @constant {number}
 */
export declare const STENCIL_VALUE_MASK = 2963;
/**
 * @constant {number}
 */
export declare const STENCIL_WRITEMASK = 2968;
/**
 * @constant {number}
 */
export declare const STENCIL_BACK_FUNC = 34816;
/**
 * @constant {number}
 */
export declare const STENCIL_BACK_FAIL = 34817;
/**
 * @constant {number}
 */
export declare const STENCIL_BACK_PASS_DEPTH_FAIL = 34818;
/**
 * @constant {number}
 */
export declare const STENCIL_BACK_PASS_DEPTH_PASS = 34819;
/**
 * @constant {number}
 */
export declare const STENCIL_BACK_REF = 36003;
/**
 * @constant {number}
 */
export declare const STENCIL_BACK_VALUE_MASK = 36004;
/**
 * @constant {number}
 */
export declare const STENCIL_BACK_WRITEMASK = 36005;
/**
 * Returns an Int32Array with four elements for the current viewport dimensions
 * @constant {number}
 */
export declare const VIEWPORT = 2978;
/**
 * Returns an Int32Array with four elements for the current scissor box dimensions
 * @constant {number}
 */
export declare const SCISSOR_BOX = 3088;
/**
 * @constant {number}
 */
export declare const COLOR_CLEAR_VALUE = 3106;
/**
 * @constant {number}
 */
export declare const COLOR_WRITEMASK = 3107;
/**
 * @constant {number}
 */
export declare const UNPACK_ALIGNMENT = 3317;
/**
 * @constant {number}
 */
export declare const PACK_ALIGNMENT = 3333;
/**
 * @constant {number}
 */
export declare const MAX_TEXTURE_SIZE = 3379;
/**
 * @constant {number}
 */
export declare const MAX_VIEWPORT_DIMS = 3386;
/**
 * @constant {number}
 */
export declare const SUBPIXEL_BITS = 3408;
/**
 * @constant {number}
 */
export declare const RED_BITS = 3410;
/**
 * @constant {number}
 */
export declare const GREEN_BITS = 3411;
/**
 * @constant {number}
 */
export declare const BLUE_BITS = 3412;
/**
 * @constant {number}
 */
export declare const ALPHA_BITS = 3413;
/**
 * @constant {number}
 */
export declare const DEPTH_BITS = 3414;
/**
 * @constant {number}
 */
export declare const STENCIL_BITS = 3415;
/**
 * @constant {number}
 */
export declare const POLYGON_OFFSET_UNITS = 10752;
/**
 * @constant {number}
 */
export declare const POLYGON_OFFSET_FACTOR = 32824;
/**
 * @constant {number}
 */
export declare const TEXTURE_BINDING_2D = 32873;
/**
 * @constant {number}
 */
export declare const SAMPLE_BUFFERS = 32936;
/**
 * @constant {number}
 */
export declare const SAMPLES = 32937;
/**
 * @constant {number}
 */
export declare const SAMPLE_COVERAGE_VALUE = 32938;
/**
 * @constant {number}
 */
export declare const SAMPLE_COVERAGE_INVERT = 32939;
/**
 * @constant {number}
 */
export declare const COMPRESSED_TEXTURE_FORMATS = 34467;
/**
 * @constant {number}
 */
export declare const VENDOR = 7936;
/**
 * @constant {number}
 */
export declare const RENDERER = 7937;
/**
 * @constant {number}
 */
export declare const VERSION = 7938;
/**
 * @constant {number}
 */
export declare const IMPLEMENTATION_COLOR_READ_TYPE = 35738;
/**
 * @constant {number}
 */
export declare const IMPLEMENTATION_COLOR_READ_FORMAT = 35739;
/**
 * @constant {number}
 */
export declare const BROWSER_DEFAULT_WEBGL = 37444;
/**
 * Passed to bufferData as a hint about whether the contents of the buffer are likely to be used often and not change often
 * @constant {number}
 */
export declare const STATIC_DRAW = 35044;
/**
 * Passed to bufferData as a hint about whether the contents of the buffer are likely to not be used often
 * @constant {number}
 */
export declare const STREAM_DRAW = 35040;
/**
 * Passed to bufferData as a hint about whether the contents of the buffer are likely to be used often and change often
 * @constant {number}
 */
export declare const DYNAMIC_DRAW = 35048;
/**
 * Passed to bindBuffer or bufferData to specify the type of buffer being used
 * @constant {number}
 */
export declare const ARRAY_BUFFER = 34962;
/**
 * Passed to bindBuffer or bufferData to specify the type of buffer being used
 * @constant {number}
 */
export declare const ELEMENT_ARRAY_BUFFER = 34963;
/**
 * Passed to getBufferParameter to get a buffer's size
 * @constant {number}
 */
export declare const BUFFER_SIZE = 34660;
/**
 * Passed to getBufferParameter to get the hint for the buffer passed in when it was created
 * @constant {number}
 */
export declare const BUFFER_USAGE = 34661;
/**
 * Passed to getVertexAttrib to read back the current vertex attribute
 * @constant {number}
 */
export declare const CURRENT_VERTEX_ATTRIB = 34342;
/**
 * @constant {number}
 */
export declare const VERTEX_ATTRIB_ARRAY_ENABLED = 34338;
/**
 * @constant {number}
 */
export declare const VERTEX_ATTRIB_ARRAY_SIZE = 34339;
/**
 * @constant {number}
 */
export declare const VERTEX_ATTRIB_ARRAY_STRIDE = 34340;
/**
 * @constant {number}
 */
export declare const VERTEX_ATTRIB_ARRAY_TYPE = 34341;
/**
 * @constant {number}
 */
export declare const VERTEX_ATTRIB_ARRAY_NORMALIZED = 34922;
/**
 * @constant {number}
 */
export declare const VERTEX_ATTRIB_ARRAY_POINTER = 34373;
/**
 * @constant {number}
 */
export declare const VERTEX_ATTRIB_ARRAY_BUFFER_BINDING = 34975;
/**
 * Passed to enable/disable to turn on/off culling. Can also be used with getParameter to find the current culling method
 * @constant {number}
 */
export declare const CULL_FACE = 2884;
/**
 * Passed to cullFace to specify that only front faces should be culled
 * @constant {number}
 */
export declare const FRONT = 1028;
/**
 * Passed to cullFace to specify that only back faces should be culled
 * @constant {number}
 */
export declare const BACK = 1029;
/**
 * Passed to cullFace to specify that front and back faces should be culled
 * @constant {number}
 */
export declare const FRONT_AND_BACK = 1032;
/**
 * Passed to enable/disable to turn on/off blending. Can also be used with getParameter to find the current blending method
 * @constant {number}
 */
export declare const BLEND = 3042;
/**
 * Passed to enable/disable to turn on/off the depth test. Can also be used with getParameter to query the depth test
 * @constant {number}
 */
export declare const DEPTH_TEST = 2929;
/**
 * Passed to enable/disable to turn on/off dithering. Can also be used with getParameter to find the current dithering method
 * @constant {number}
 */
export declare const DITHER = 3024;
/**
 * Passed to enable/disable to turn on/off the polygon offset. Useful for rendering hidden-line images, decals, and or solids with highlighted edges. Can also be used with getParameter to query the scissor test
 * @constant {number}
 */
export declare const POLYGON_OFFSET_FILL = 32823;
/**
 * Passed to enable/disable to turn on/off the alpha to coverage. Used in multi-sampling alpha channels
 * @constant {number}
 */
export declare const SAMPLE_ALPHA_TO_COVERAGE = 32926;
/**
 * Passed to enable/disable to turn on/off the sample coverage. Used in multi-sampling
 * @constant {number}
 */
export declare const SAMPLE_COVERAGE = 32928;
/**
 * Passed to enable/disable to turn on/off the scissor test. Can also be used with getParameter to query the scissor test
 * @constant {number}
 */
export declare const SCISSOR_TEST = 3089;
/**
 * Passed to enable/disable to turn on/off the stencil test. Can also be used with getParameter to query the stencil test
 * @constant {number}
 */
export declare const STENCIL_TEST = 2960;
/**
 * Returned from getError
 * @constant {number}
 */
export declare const NO_ERROR = 0;
/**
 * Returned from getError
 * @constant {number}
 */
export declare const INVALID_ENUM = 1280;
/**
 * Returned from getError
 * @constant {number}
 */
export declare const INVALID_VALUE = 1281;
/**
 * Returned from getError
 * @constant {number}
 */
export declare const INVALID_OPERATION = 1282;
/**
 * Returned from getError
 * @constant {number}
 */
export declare const OUT_OF_MEMORY = 1285;
/**
 * Returned from getError
 * @constant {number}
 */
export declare const CONTEXT_LOST_WEBGL = 37442;
/**
 * Passed to frontFace to specify the front face of a polygon is drawn in the clockwise direction,
 * @constant {number}
 */
export declare const CW = 2304;
/**
 * Passed to frontFace to specify the front face of a polygon is drawn in the counter clockwise direction
 * @constant {number}
 */
export declare const CCW = 2305;
/**
 * There is no preference for this behavior
 * @constant {number}
 */
export declare const DONT_CARE = 4352;
/**
 * The most efficient behavior should be used
 * @constant {number}
 */
export declare const FASTEST = 4353;
/**
 * The most correct or the highest quality option should be used
 * @constant {number}
 */
export declare const NICEST = 4354;
/**
 * Hint for the quality of filtering when generating mipmap images with WebGLRenderingContext.generateMipmap()
 * @constant {number}
 */
export declare const GENERATE_MIPMAP_HINT = 33170;
/**
 * @constant {number}
 */
export declare const BYTE = 5120;
/**
 * @constant {number}
 */
export declare const UNSIGNED_BYTE = 5121;
/**
 * @constant {number}
 */
export declare const SHORT = 5122;
/**
 * @constant {number}
 */
export declare const UNSIGNED_SHORT = 5123;
/**
 * @constant {number}
 */
export declare const INT = 5124;
/**
 * @constant {number}
 */
export declare const UNSIGNED_INT = 5125;
/**
 * @constant {number}
 */
export declare const FLOAT = 5126;
/**
 * @constant {number}
 */
export declare const DEPTH_COMPONENT = 6402;
/**
 * @constant {number}
 */
export declare const ALPHA = 6406;
/**
 * @constant {number}
 */
export declare const RGB = 6407;
/**
 * @constant {number}
 */
export declare const RGBA = 6408;
/**
 * @constant {number}
 */
export declare const LUMINANCE = 6409;
/**
 * @constant {number}
 */
export declare const LUMINANCE_ALPHA = 6410;
/**
 * @constant {number}
 */
export declare const UNSIGNED_SHORT_4_4_4_4 = 32819;
/**
 * @constant {number}
 */
export declare const UNSIGNED_SHORT_5_5_5_1 = 32820;
/**
 * @constant {number}
 */
export declare const UNSIGNED_SHORT_5_6_5 = 33635;
/**
 * Passed to createShader to define a fragment shader
 * @constant {number}
 */
export declare const FRAGMENT_SHADER = 35632;
/**
 * Passed to createShader to define a vertex shader
 * @constant {number}
 */
export declare const VERTEX_SHADER = 35633;
/**
 * Passed to getShaderParamter to get the status of the compilation. Returns false if the shader was not compiled. You can then query getShaderInfoLog to find the exact error
 * @constant {number}
 */
export declare const COMPILE_STATUS = 35713;
/**
 * Passed to getShaderParamter to determine if a shader was deleted via deleteShader. Returns true if it was, false otherwise
 * @constant {number}
 */
export declare const DELETE_STATUS = 35712;
/**
 * Passed to getProgramParameter after calling linkProgram to determine if a program was linked correctly. Returns false if there were errors. Use getProgramInfoLog to find the exact error
 * @constant {number}
 */
export declare const LINK_STATUS = 35714;
/**
 * Passed to getProgramParameter after calling validateProgram to determine if it is valid. Returns false if errors were found
 * @constant {number}
 */
export declare const VALIDATE_STATUS = 35715;
/**
 * Passed to getProgramParameter after calling attachShader to determine if the shader was attached correctly. Returns false if errors occurred
 * @constant {number}
 */
export declare const ATTACHED_SHADERS = 35717;
/**
 * Passed to getProgramParameter to get the number of attributes active in a program
 * @constant {number}
 */
export declare const ACTIVE_ATTRIBUTES = 35721;
/**
 * Passed to getProgramParamter to get the number of uniforms active in a program
 * @constant {number}
 */
export declare const ACTIVE_UNIFORMS = 35718;
/**
 * The maximum number of entries possible in the vertex attribute list
 * @constant {number}
 */
export declare const MAX_VERTEX_ATTRIBS = 34921;
/**
 * @constant {number}
 */
export declare const MAX_VERTEX_UNIFORM_VECTORS = 36347;
/**
 * @constant {number}
 */
export declare const MAX_VARYING_VECTORS = 36348;
/**
 * @constant {number}
 */
export declare const MAX_COMBINED_TEXTURE_IMAGE_UNITS = 35661;
/**
 * @constant {number}
 */
export declare const MAX_VERTEX_TEXTURE_IMAGE_UNITS = 35660;
/**
 * Implementation dependent number of maximum texture units. At least 8
 * @constant {number}
 */
export declare const MAX_TEXTURE_IMAGE_UNITS = 34930;
/**
 * @constant {number}
 */
export declare const MAX_FRAGMENT_UNIFORM_VECTORS = 36349;
/**
 * @constant {number}
 */
export declare const SHADER_TYPE = 35663;
/**
 * @constant {number}
 */
export declare const SHADING_LANGUAGE_VERSION = 35724;
/**
 * @constant {number}
 */
export declare const CURRENT_PROGRAM = 35725;
/**
 * Passed to depthFunction or stencilFunction to specify depth or stencil tests will never pass. i.e. Nothing will be drawn
 * @constant {number}
 */
export declare const NEVER = 512;
/**
 * Passed to depthFunction or stencilFunction to specify depth or stencil tests will always pass. i.e. Pixels will be drawn in the order they are drawn
 * @constant {number}
 */
export declare const ALWAYS = 519;
/**
 * Passed to depthFunction or stencilFunction to specify depth or stencil tests will pass if the new depth value is less than the stored value
 * @constant {number}
 */
export declare const LESS = 513;
/**
 * Passed to depthFunction or stencilFunction to specify depth or stencil tests will pass if the new depth value is equals to the stored value
 * @constant {number}
 */
export declare const EQUAL = 514;
/**
 *  Passed to depthFunction or stencilFunction to specify depth or stencil tests will pass if the new depth value is less than or equal to the stored value
 * @constant {number}
 */
export declare const LEQUAL = 515;
/**
 * Passed to depthFunction or stencilFunction to specify depth or stencil tests will pass if the new depth value is greater than the stored value
 * @constant {number}
 */
export declare const GREATER = 516;
/**
 * Passed to depthFunction or stencilFunction to specify depth or stencil tests will pass if the new depth value is greater than or equal to the stored value
 * @constant {number}
 */
export declare const GEQUAL = 518;
/**
 * Passed to depthFunction or stencilFunction to specify depth or stencil tests will pass if the new depth value is not equal to the stored value
 * @constant {number}
 */
export declare const NOTEQUAL = 517;
/**
 * @constant {number}
 */
export declare const KEEP = 7680;
/**
 * @constant {number}
 */
export declare const REPLACE = 7681;
/**
 * @constant {number}
 */
export declare const INCR = 7682;
/**
 * @constant {number}
 */
export declare const DECR = 7683;
/**
 * @constant {number}
 */
export declare const INVERT = 5386;
/**
 * @constant {number}
 */
export declare const INCR_WRAP = 34055;
/**
 * @constant {number}
 */
export declare const DECR_WRAP = 34056;
/**
 * @constant {number}
 */
export declare const NEAREST = 9728;
/**
 * @constant {number}
 */
export declare const LINEAR = 9729;
/**
 * @constant {number}
 */
export declare const NEAREST_MIPMAP_NEAREST = 9984;
/**
 * @constant {number}
 */
export declare const LINEAR_MIPMAP_NEAREST = 9985;
/**
 * @constant {number}
 */
export declare const NEAREST_MIPMAP_LINEAR = 9986;
/**
 * @constant {number}
 */
export declare const LINEAR_MIPMAP_LINEAR = 9987;
/**
 * @constant {number}
 */
export declare const TEXTURE_MAG_FILTER = 10240;
/**
 * @constant {number}
 */
export declare const TEXTURE_MIN_FILTER = 10241;
/**
 * @constant {number}
 */
export declare const TEXTURE_WRAP_S = 10242;
/**
 * @constant {number}
 */
export declare const TEXTURE_WRAP_T = 10243;
/**
 * @constant {number}
 */
export declare const TEXTURE_2D = 3553;
/**
 * @constant {number}
 */
export declare const TEXTURE = 5890;
/**
 * @constant {number}
 */
export declare const TEXTURE_CUBE_MAP = 34067;
/**
 * @constant {number}
 */
export declare const TEXTURE_BINDING_CUBE_MAP = 34068;
/**
 * @constant {number}
 */
export declare const TEXTURE_CUBE_MAP_POSITIVE_X = 34069;
/**
 * @constant {number}
 */
export declare const TEXTURE_CUBE_MAP_NEGATIVE_X = 34070;
/**
 * @constant {number}
 */
export declare const TEXTURE_CUBE_MAP_POSITIVE_Y = 34071;
/**
 * @constant {number}
 */
export declare const TEXTURE_CUBE_MAP_NEGATIVE_Y = 34072;
/**
 * @constant {number}
 */
export declare const TEXTURE_CUBE_MAP_POSITIVE_Z = 34073;
/**
 * @constant {number}
 */
export declare const TEXTURE_CUBE_MAP_NEGATIVE_Z = 34074;
/**
 * @constant {number}
 */
export declare const MAX_CUBE_MAP_TEXTURE_SIZE = 34076;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE0 = 33984;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE1 = 33985;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE2 = 33986;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE3 = 33987;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE4 = 33988;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE5 = 33989;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE6 = 33990;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE7 = 33991;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE8 = 33992;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE9 = 33993;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE10 = 33994;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE11 = 33995;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE12 = 33996;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE13 = 33997;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE14 = 33998;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE15 = 33999;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE16 = 34000;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE17 = 34001;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE18 = 34002;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE19 = 34003;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE20 = 34004;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE21 = 34005;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE22 = 34006;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE23 = 34007;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE24 = 34008;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE25 = 34009;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE26 = 34010;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE27 = 34011;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE28 = 34012;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE29 = 34013;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE30 = 34014;
/**
 * A texture unit
 * @constant {number}
 */
export declare const TEXTURE31 = 34015;
/**
 * The current active texture unit
 * @constant {number}
 */
export declare const ACTIVE_TEXTURE = 34016;
/**
 * @constant {number}
 */
export declare const REPEAT = 10497;
/**
 * @constant {number}
 */
export declare const CLAMP_TO_EDGE = 33071;
/**
 * @constant {number}
 */
export declare const MIRRORED_REPEAT = 33648;
/**
 * @constant {number}
 */
export declare const FLOAT_VEC2 = 35664;
/**
 * @constant {number}
 */
export declare const FLOAT_VEC3 = 35665;
/**
 * @constant {number}
 */
export declare const FLOAT_VEC4 = 35666;
/**
 * @constant {number}
 */
export declare const INT_VEC2 = 35667;
/**
 * @constant {number}
 */
export declare const INT_VEC3 = 35668;
/**
 * @constant {number}
 */
export declare const INT_VEC4 = 35669;
/**
 * @constant {number}
 */
export declare const BOOL = 35670;
/**
 * @constant {number}
 */
export declare const BOOL_VEC2 = 35671;
/**
 * @constant {number}
 */
export declare const BOOL_VEC3 = 35672;
/**
 * @constant {number}
 */
export declare const BOOL_VEC4 = 35673;
/**
 * @constant {number}
 */
export declare const FLOAT_MAT2 = 35674;
/**
 * @constant {number}
 */
export declare const FLOAT_MAT3 = 35675;
/**
 * @constant {number}
 */
export declare const FLOAT_MAT4 = 35676;
/**
 * @constant {number}
 */
export declare const SAMPLER_2D = 35678;
/**
 * @constant {number}
 */
export declare const SAMPLER_CUBE = 35680;
/**
 * @constant {number}
 */
export declare const LOW_FLOAT = 36336;
/**
 * @constant {number}
 */
export declare const MEDIUM_FLOAT = 36337;
/**
 * @constant {number}
 */
export declare const HIGH_FLOAT = 36338;
/**
 * @constant {number}
 */
export declare const LOW_INT = 36339;
/**
 * @constant {number}
 */
export declare const MEDIUM_INT = 36340;
/**
 * @constant {number}
 */
export declare const HIGH_INT = 36341;
/**
 * @constant {number}
 */
export declare const FRAMEBUFFER = 36160;
/**
 * @constant {number}
 */
export declare const RENDERBUFFER = 36161;
/**
 * @constant {number}
 */
export declare const RGBA4 = 32854;
/**
 * @constant {number}
 */
export declare const RGB5_A1 = 32855;
/**
 * @constant {number}
 */
export declare const RGB565 = 36194;
/**
 * @constant {number}
 */
export declare const DEPTH_COMPONENT16 = 33189;
/**
 * @constant {number}
 */
export declare const STENCIL_INDEX = 6401;
/**
 * @constant {number}
 */
export declare const STENCIL_INDEX8 = 36168;
/**
 * @constant {number}
 */
export declare const DEPTH_STENCIL = 34041;
/**
 * @constant {number}
 */
export declare const RENDERBUFFER_WIDTH = 36162;
/**
 * @constant {number}
 */
export declare const RENDERBUFFER_HEIGHT = 36163;
/**
 * @constant {number}
 */
export declare const RENDERBUFFER_INTERNAL_FORMAT = 36164;
/**
 * @constant {number}
 */
export declare const RENDERBUFFER_RED_SIZE = 36176;
/**
 * @constant {number}
 */
export declare const RENDERBUFFER_GREEN_SIZE = 36177;
/**
 * @constant {number}
 */
export declare const RENDERBUFFER_BLUE_SIZE = 36178;
/**
 * @constant {number}
 */
export declare const RENDERBUFFER_ALPHA_SIZE = 36179;
/**
 * @constant {number}
 */
export declare const RENDERBUFFER_DEPTH_SIZE = 36180;
/**
 * @constant {number}
 */
export declare const RENDERBUFFER_STENCIL_SIZE = 36181;
/**
 * @constant {number}
 */
export declare const FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE = 36048;
/**
 * @constant {number}
 */
export declare const FRAMEBUFFER_ATTACHMENT_OBJECT_NAME = 36049;
/**
 * @constant {number}
 */
export declare const FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL = 36050;
/**
 * @constant {number}
 */
export declare const FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE = 36051;
/**
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT0 = 36064;
/**
 * @constant {number}
 */
export declare const DEPTH_ATTACHMENT = 36096;
/**
 * @constant {number}
 */
export declare const STENCIL_ATTACHMENT = 36128;
/**
 * @constant {number}
 */
export declare const DEPTH_STENCIL_ATTACHMENT = 33306;
/**
 * @constant {number}
 */
export declare const NONE = 0;
/**
 * @constant {number}
 */
export declare const FRAMEBUFFER_COMPLETE = 36053;
/**
 * @constant {number}
 */
export declare const FRAMEBUFFER_INCOMPLETE_ATTACHMENT = 36054;
/**
 * @constant {number}
 */
export declare const FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 36055;
/**
 * @constant {number}
 */
export declare const FRAMEBUFFER_INCOMPLETE_DIMENSIONS = 36057;
/**
 * @constant {number}
 */
export declare const FRAMEBUFFER_UNSUPPORTED = 36061;
/**
 * @constant {number}
 */
export declare const FRAMEBUFFER_BINDING = 36006;
/**
 * @constant {number}
 */
export declare const RENDERBUFFER_BINDING = 36007;
/**
 * @constant {number}
 */
export declare const MAX_RENDERBUFFER_SIZE = 34024;
/**
 * @constant {number}
 */
export declare const INVALID_FRAMEBUFFER_OPERATION = 1286;
/**
 * @constant {number}
 */
export declare const UNPACK_FLIP_Y_WEBGL = 37440;
/**
 * @constant {number}
 */
export declare const UNPACK_PREMULTIPLY_ALPHA_WEBGL = 37441;
/**
 * @constant {number}
 */
export declare const UNPACK_COLORSPACE_CONVERSION_WEBGL = 37443;
/**
 * @constant {number}
 */
export declare const READ_BUFFER = 3074;
/**
 * @constant {number}
 */
export declare const UNPACK_ROW_LENGTH = 3314;
/**
 * @constant {number}
 */
export declare const UNPACK_SKIP_ROWS = 3315;
/**
 * @constant {number}
 */
export declare const UNPACK_SKIP_PIXELS = 3316;
/**
 * @constant {number}
 */
export declare const PACK_ROW_LENGTH = 3330;
/**
 * @constant {number}
 */
export declare const PACK_SKIP_ROWS = 3331;
/**
 * @constant {number}
 */
export declare const PACK_SKIP_PIXELS = 3332;
/**
 * @constant {number}
 */
export declare const TEXTURE_BINDING_3D = 32874;
/**
 * @constant {number}
 */
export declare const UNPACK_SKIP_IMAGES = 32877;
/**
 * @constant {number}
 */
export declare const UNPACK_IMAGE_HEIGHT = 32878;
/**
 * @constant {number}
 */
export declare const MAX_3D_TEXTURE_SIZE = 32883;
/**
 * @constant {number}
 */
export declare const MAX_ELEMENTS_VERTICES = 33000;
/**
 * @constant {number}
 */
export declare const MAX_ELEMENTS_INDICES = 33001;
/**
 * @constant {number}
 */
export declare const MAX_TEXTURE_LOD_BIAS = 34045;
/**
 * @constant {number}
 */
export declare const MAX_FRAGMENT_UNIFORM_COMPONENTS = 35657;
/**
 * @constant {number}
 */
export declare const MAX_VERTEX_UNIFORM_COMPONENTS = 35658;
/**
 * @constant {number}
 */
export declare const MAX_ARRAY_TEXTURE_LAYERS = 35071;
/**
 * @constant {number}
 */
export declare const MIN_PROGRAM_TEXEL_OFFSET = 35076;
/**
 * @constant {number}
 */
export declare const MAX_PROGRAM_TEXEL_OFFSET = 35077;
/**
 * @constant {number}
 */
export declare const MAX_VARYING_COMPONENTS = 35659;
/**
 * @constant {number}
 */
export declare const FRAGMENT_SHADER_DERIVATIVE_HINT = 35723;
/**
 * @constant {number}
 */
export declare const RASTERIZER_DISCARD = 35977;
/**
 * @constant {number}
 */
export declare const VERTEX_ARRAY_BINDING = 34229;
/**
 * @constant {number}
 */
export declare const MAX_VERTEX_OUTPUT_COMPONENTS = 37154;
/**
 * @constant {number}
 */
export declare const MAX_FRAGMENT_INPUT_COMPONENTS = 37157;
/**
 * @constant {number}
 */
export declare const MAX_SERVER_WAIT_TIMEOUT = 37137;
/**
 * @constant {number}
 */
export declare const MAX_ELEMENT_INDEX = 36203;
/**
 * @constant {number}
 */
export declare const RED = 6403;
/**
 * @constant {number}
 */
export declare const RGB8 = 32849;
/**
 * @constant {number}
 */
export declare const RGBA8 = 32856;
/**
 * @constant {number}
 */
export declare const RGB10_A2 = 32857;
/**
 * @constant {number}
 */
export declare const TEXTURE_3D = 32879;
/**
 * @constant {number}
 */
export declare const TEXTURE_WRAP_R = 32882;
/**
 * @constant {number}
 */
export declare const TEXTURE_MIN_LOD = 33082;
/**
 * @constant {number}
 */
export declare const TEXTURE_MAX_LOD = 33083;
/**
 * @constant {number}
 */
export declare const TEXTURE_BASE_LEVEL = 33084;
/**
 * @constant {number}
 */
export declare const TEXTURE_MAX_LEVEL = 33085;
/**
 * @constant {number}
 */
export declare const TEXTURE_COMPARE_MODE = 34892;
/**
 * @constant {number}
 */
export declare const TEXTURE_COMPARE_FUNC = 34893;
/**
 * @constant {number}
 */
export declare const SRGB = 35904;
/**
 * @constant {number}
 */
export declare const SRGB8 = 35905;
/**
 * @constant {number}
 */
export declare const SRGB8_ALPHA8 = 35907;
/**
 * @constant {number}
 */
export declare const COMPARE_REF_TO_TEXTURE = 34894;
/**
 * @constant {number}
 */
export declare const RGBA32F = 34836;
/**
 * @constant {number}
 */
export declare const RGB32F = 34837;
/**
 * @constant {number}
 */
export declare const RGBA16F = 34842;
/**
 * @constant {number}
 */
export declare const RGB16F = 34843;
/**
 * @constant {number}
 */
export declare const TEXTURE_2D_ARRAY = 35866;
/**
 * @constant {number}
 */
export declare const TEXTURE_BINDING_2D_ARRAY = 35869;
/**
 * @constant {number}
 */
export declare const R11F_G11F_B10F = 35898;
/**
 * @constant {number}
 */
export declare const RGB9_E5 = 35901;
/**
 * @constant {number}
 */
export declare const RGBA32UI = 36208;
/**
 * @constant {number}
 */
export declare const RGB32UI = 36209;
/**
 * @constant {number}
 */
export declare const RGBA16UI = 36214;
/**
 * @constant {number}
 */
export declare const RGB16UI = 36215;
/**
 * @constant {number}
 */
export declare const RGBA8UI = 36220;
/**
 * @constant {number}
 */
export declare const RGB8UI = 36221;
/**
 * @constant {number}
 */
export declare const RGBA32I = 36226;
/**
 * @constant {number}
 */
export declare const RGB32I = 36227;
/**
 * @constant {number}
 */
export declare const RGBA16I = 36232;
/**
 * @constant {number}
 */
export declare const RGB16I = 36233;
/**
 * @constant {number}
 */
export declare const RGBA8I = 36238;
/**
 * @constant {number}
 */
export declare const RGB8I = 36239;
/**
 * @constant {number}
 */
export declare const RED_INTEGER = 36244;
/**
 * @constant {number}
 */
export declare const RGB_INTEGER = 36248;
/**
 * @constant {number}
 */
export declare const RGBA_INTEGER = 36249;
/**
 * @constant {number}
 */
export declare const R8 = 33321;
/**
 * @constant {number}
 */
export declare const RG8 = 33323;
/**
 * @constant {number}
 */
export declare const R16F = 33325;
/**
 * @constant {number}
 */
export declare const R32F = 33326;
/**
 * @constant {number}
 */
export declare const RG16F = 33327;
/**
 * @constant {number}
 */
export declare const RG32F = 33328;
/**
 * @constant {number}
 */
export declare const R8I = 33329;
/**
 * @constant {number}
 */
export declare const R8UI = 33330;
/**
 * @constant {number}
 */
export declare const R16I = 33331;
/**
 * @constant {number}
 */
export declare const R16UI = 33332;
/**
 * @constant {number}
 */
export declare const R32I = 33333;
/**
 * @constant {number}
 */
export declare const R32UI = 33334;
/**
 * @constant {number}
 */
export declare const RG8I = 33335;
/**
 * @constant {number}
 */
export declare const RG8UI = 33336;
/**
 * @constant {number}
 */
export declare const RG16I = 33337;
/**
 * @constant {number}
 */
export declare const RG16UI = 33338;
/**
 * @constant {number}
 */
export declare const RG32I = 33339;
/**
 * @constant {number}
 */
export declare const RG32UI = 33340;
/**
 * @constant {number}
 */
export declare const R8_SNORM = 36756;
/**
 * @constant {number}
 */
export declare const RG8_SNORM = 36757;
/**
 * @constant {number}
 */
export declare const RGB8_SNORM = 36758;
/**
 * @constant {number}
 */
export declare const RGBA8_SNORM = 36759;
/**
 * @constant {number}
 */
export declare const RGB10_A2UI = 36975;
/**
 * @constant {number}
 */
export declare const TEXTURE_IMMUTABLE_FORMAT = 37167;
/**
 * @constant {number}
 */
export declare const TEXTURE_IMMUTABLE_LEVELS = 33503;
/**
 * @constant {number}
 */
export declare const UNSIGNED_INT_2_10_10_10_REV = 33640;
/**
 * @constant {number}
 */
export declare const UNSIGNED_INT_10F_11F_11F_REV = 35899;
/**
 * @constant {number}
 */
export declare const UNSIGNED_INT_5_9_9_9_REV = 35902;
/**
 * @constant {number}
 */
export declare const FLOAT_32_UNSIGNED_INT_24_8_REV = 36269;
/**
 * @constant {number}
 */
export declare const UNSIGNED_INT_24_8 = 34042;
/**
 * @constant {number}
 */
export declare const HALF_FLOAT = 5131;
/**
 * @constant {number}
 */
export declare const RG = 33319;
/**
 * @constant {number}
 */
export declare const RG_INTEGER = 33320;
/**
 * @constant {number}
 */
export declare const INT_2_10_10_10_REV = 36255;
/**
 * @constant {number}
 */
export declare const CURRENT_QUERY = 34917;
/**
 * @constant {number}
 */
export declare const QUERY_RESULT = 34918;
/**
 * @constant {number}
 */
export declare const QUERY_RESULT_AVAILABLE = 34919;
/**
 * @constant {number}
 */
export declare const ANY_SAMPLES_PASSED = 35887;
/**
 * @constant {number}
 */
export declare const ANY_SAMPLES_PASSED_CONSERVATIVE = 36202;
/**
 * @constant {number}
 */
export declare const MAX_DRAW_BUFFERS = 34852;
/**
 * @constant {number}
 */
export declare const DRAW_BUFFER0 = 34853;
/**
 * @constant {number}
 */
export declare const DRAW_BUFFER1 = 34854;
/**
 * @constant {number}
 */
export declare const DRAW_BUFFER2 = 34855;
/**
 * @constant {number}
 */
export declare const DRAW_BUFFER3 = 34856;
/**
 * @constant {number}
 */
export declare const DRAW_BUFFER4 = 34857;
/**
 * @constant {number}
 */
export declare const DRAW_BUFFER5 = 34858;
/**
 * @constant {number}
 */
export declare const DRAW_BUFFER6 = 34859;
/**
 * @constant {number}
 */
export declare const DRAW_BUFFER7 = 34860;
/**
 * @constant {number}
 */
export declare const DRAW_BUFFER8 = 34861;
/**
 * @constant {number}
 */
export declare const DRAW_BUFFER9 = 34862;
/**
 * @constant {number}
 */
export declare const DRAW_BUFFER10 = 34863;
/**
 * @constant {number}
 */
export declare const DRAW_BUFFER11 = 34864;
/**
 * @constant {number}
 */
export declare const DRAW_BUFFER12 = 34865;
/**
 * @constant {number}
 */
export declare const DRAW_BUFFER13 = 34866;
/**
 * @constant {number}
 */
export declare const DRAW_BUFFER14 = 34867;
/**
 * @constant {number}
 */
export declare const DRAW_BUFFER15 = 34868;
/**
 * @constant {number}
 */
export declare const MAX_COLOR_ATTACHMENTS = 36063;
/**
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT1 = 36065;
/**
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT2 = 36066;
/**
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT3 = 36067;
/**
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT4 = 36068;
/**
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT5 = 36069;
/**
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT6 = 36070;
/**
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT7 = 36071;
/**
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT8 = 36072;
/**
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT9 = 36073;
/**
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT10 = 36074;
/**
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT11 = 36075;
/**
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT12 = 36076;
/**
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT13 = 36077;
/**
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT14 = 36078;
/**
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT15 = 36079;
/**
 * @constant {number}
 */
export declare const SAMPLER_3D = 35679;
/**
 * @constant {number}
 */
export declare const SAMPLER_2D_SHADOW = 35682;
/**
 * @constant {number}
 */
export declare const SAMPLER_2D_ARRAY = 36289;
/**
 * @constant {number}
 */
export declare const SAMPLER_2D_ARRAY_SHADOW = 36292;
/**
 * @constant {number}
 */
export declare const SAMPLER_CUBE_SHADOW = 36293;
/**
 * @constant {number}
 */
export declare const INT_SAMPLER_2D = 36298;
/**
 * @constant {number}
 */
export declare const INT_SAMPLER_3D = 36299;
/**
 * @constant {number}
 */
export declare const INT_SAMPLER_CUBE = 36300;
/**
 * @constant {number}
 */
export declare const INT_SAMPLER_2D_ARRAY = 36303;
/**
 * @constant {number}
 */
export declare const UNSIGNED_INT_SAMPLER_2D = 36306;
/**
 * @constant {number}
 */
export declare const UNSIGNED_INT_SAMPLER_3D = 36307;
/**
 * @constant {number}
 */
export declare const UNSIGNED_INT_SAMPLER_CUBE = 36308;
/**
 * @constant {number}
 */
export declare const UNSIGNED_INT_SAMPLER_2D_ARRAY = 36311;
/**
 * @constant {number}
 */
export declare const MAX_SAMPLES = 36183;
/**
 * @constant {number}
 */
export declare const SAMPLER_BINDING = 35097;
/**
 * @constant {number}
 */
export declare const PIXEL_PACK_BUFFER = 35051;
/**
 * @constant {number}
 */
export declare const PIXEL_UNPACK_BUFFER = 35052;
/**
 * @constant {number}
 */
export declare const PIXEL_PACK_BUFFER_BINDING = 35053;
/**
 * @constant {number}
 */
export declare const PIXEL_UNPACK_BUFFER_BINDING = 35055;
/**
 * @constant {number}
 */
export declare const COPY_READ_BUFFER = 36662;
/**
 * @constant {number}
 */
export declare const COPY_WRITE_BUFFER = 36663;
/**
 * @constant {number}
 */
export declare const COPY_READ_BUFFER_BINDING = 36662;
/**
 * @constant {number}
 */
export declare const COPY_WRITE_BUFFER_BINDING = 36663;
/**
 * @constant {number}
 */
export declare const FLOAT_MAT2X3 = 35685;
/**
 * @constant {number}
 */
export declare const FLOAT_MAT2X4 = 35686;
/**
 * @constant {number}
 */
export declare const FLOAT_MAT3X2 = 35687;
/**
 * @constant {number}
 */
export declare const FLOAT_MAT3X4 = 35688;
/**
 * @constant {number}
 */
export declare const FLOAT_MAT4X2 = 35689;
/**
 * @constant {number}
 */
export declare const FLOAT_MAT4X3 = 35690;
/**
 * @constant {number}
 */
export declare const UNSIGNED_INT_VEC2 = 36294;
/**
 * @constant {number}
 */
export declare const UNSIGNED_INT_VEC3 = 36295;
/**
 * @constant {number}
 */
export declare const UNSIGNED_INT_VEC4 = 36296;
/**
 * @constant {number}
 */
export declare const UNSIGNED_NORMALIZED = 35863;
/**
 * @constant {number}
 */
export declare const SIGNED_NORMALIZED = 36764;
/**
 * @constant {number}
 */
export declare const VERTEX_ATTRIB_ARRAY_INTEGER = 35069;
/**
 * @constant {number}
 */
export declare const VERTEX_ATTRIB_ARRAY_DIVISOR = 35070;
/**
 * @constant {number}
 */
export declare const TRANSFORM_FEEDBACK_BUFFER_MODE = 35967;
/**
 * @constant {number}
 */
export declare const MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS = 35968;
/**
 * @constant {number}
 */
export declare const TRANSFORM_FEEDBACK_VARYINGS = 35971;
/**
 * @constant {number}
 */
export declare const TRANSFORM_FEEDBACK_BUFFER_START = 35972;
/**
 * @constant {number}
 */
export declare const TRANSFORM_FEEDBACK_BUFFER_SIZE = 35973;
/**
 * @constant {number}
 */
export declare const TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN = 35976;
/**
 * @constant {number}
 */
export declare const MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS = 35978;
/**
 * @constant {number}
 */
export declare const MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS = 35979;
/**
 * @constant {number}
 */
export declare const INTERLEAVED_ATTRIBS = 35980;
/**
 * @constant {number}
 */
export declare const SEPARATE_ATTRIBS = 35981;
/**
 * @constant {number}
 */
export declare const TRANSFORM_FEEDBACK_BUFFER = 35982;
/**
 * @constant {number}
 */
export declare const TRANSFORM_FEEDBACK_BUFFER_BINDING = 35983;
/**
 * @constant {number}
 */
export declare const TRANSFORM_FEEDBACK = 36386;
/**
 * @constant {number}
 */
export declare const TRANSFORM_FEEDBACK_PAUSED = 36387;
/**
 * @constant {number}
 */
export declare const TRANSFORM_FEEDBACK_ACTIVE = 36388;
/**
 * @constant {number}
 */
export declare const TRANSFORM_FEEDBACK_BINDING = 36389;
/**
 * @constant {number}
 */
export declare const FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING = 33296;
/**
 * @constant {number}
 */
export declare const FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE = 33297;
/**
 * @constant {number}
 */
export declare const FRAMEBUFFER_ATTACHMENT_RED_SIZE = 33298;
/**
 * @constant {number}
 */
export declare const FRAMEBUFFER_ATTACHMENT_GREEN_SIZE = 33299;
/**
 * @constant {number}
 */
export declare const FRAMEBUFFER_ATTACHMENT_BLUE_SIZE = 33300;
/**
 * @constant {number}
 */
export declare const FRAMEBUFFER_ATTACHMENT_ALPHA_SIZE = 33301;
/**
 * @constant {number}
 */
export declare const FRAMEBUFFER_ATTACHMENT_DEPTH_SIZE = 33302;
/**
 * @constant {number}
 */
export declare const FRAMEBUFFER_ATTACHMENT_STENCIL_SIZE = 33303;
/**
 * @constant {number}
 */
export declare const FRAMEBUFFER_DEFAULT = 33304;
/**
 * @constant {number}
 */
export declare const DEPTH24_STENCIL8 = 35056;
/**
 * @constant {number}
 */
export declare const DRAW_FRAMEBUFFER_BINDING = 36006;
/**
 * @constant {number}
 */
export declare const READ_FRAMEBUFFER = 36008;
/**
 * @constant {number}
 */
export declare const DRAW_FRAMEBUFFER = 36009;
/**
 * @constant {number}
 */
export declare const READ_FRAMEBUFFER_BINDING = 36010;
/**
 * @constant {number}
 */
export declare const RENDERBUFFER_SAMPLES = 36011;
/**
 * @constant {number}
 */
export declare const FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER = 36052;
/**
 * @constant {number}
 */
export declare const FRAMEBUFFER_INCOMPLETE_MULTISAMPLE = 36182;
/**
 * @constant {number}
 */
export declare const UNIFORM_BUFFER = 35345;
/**
 * @constant {number}
 */
export declare const UNIFORM_BUFFER_BINDING = 35368;
/**
 * @constant {number}
 */
export declare const UNIFORM_BUFFER_START = 35369;
/**
 * @constant {number}
 */
export declare const UNIFORM_BUFFER_SIZE = 35370;
/**
 * @constant {number}
 */
export declare const MAX_VERTEX_UNIFORM_BLOCKS = 35371;
/**
 * @constant {number}
 */
export declare const MAX_FRAGMENT_UNIFORM_BLOCKS = 35373;
/**
 * @constant {number}
 */
export declare const MAX_COMBINED_UNIFORM_BLOCKS = 35374;
/**
 * @constant {number}
 */
export declare const MAX_UNIFORM_BUFFER_BINDINGS = 35375;
/**
 * @constant {number}
 */
export declare const MAX_UNIFORM_BLOCK_SIZE = 35376;
/**
 * @constant {number}
 */
export declare const MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS = 35377;
/**
 * @constant {number}
 */
export declare const MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS = 35379;
/**
 * @constant {number}
 */
export declare const UNIFORM_BUFFER_OFFSET_ALIGNMENT = 35380;
/**
 * @constant {number}
 */
export declare const ACTIVE_UNIFORM_BLOCKS = 35382;
/**
 * @constant {number}
 */
export declare const UNIFORM_TYPE = 35383;
/**
 * @constant {number}
 */
export declare const UNIFORM_SIZE = 35384;
/**
 * @constant {number}
 */
export declare const UNIFORM_BLOCK_INDEX = 35386;
/**
 * @constant {number}
 */
export declare const UNIFORM_OFFSET = 35387;
/**
 * @constant {number}
 */
export declare const UNIFORM_ARRAY_STRIDE = 35388;
/**
 * @constant {number}
 */
export declare const UNIFORM_MATRIX_STRIDE = 35389;
/**
 * @constant {number}
 */
export declare const UNIFORM_IS_ROW_MAJOR = 35390;
/**
 * @constant {number}
 */
export declare const UNIFORM_BLOCK_BINDING = 35391;
/**
 * @constant {number}
 */
export declare const UNIFORM_BLOCK_DATA_SIZE = 35392;
/**
 * @constant {number}
 */
export declare const UNIFORM_BLOCK_ACTIVE_UNIFORMS = 35394;
/**
 * @constant {number}
 */
export declare const UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES = 35395;
/**
 * @constant {number}
 */
export declare const UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER = 35396;
/**
 * @constant {number}
 */
export declare const UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER = 35398;
/**
 * @constant {number}
 */
export declare const OBJECT_TYPE = 37138;
/**
 * @constant {number}
 */
export declare const SYNC_CONDITION = 37139;
/**
 * @constant {number}
 */
export declare const SYNC_STATUS = 37140;
/**
 * @constant {number}
 */
export declare const SYNC_FLAGS = 37141;
/**
 * @constant {number}
 */
export declare const SYNC_FENCE = 37142;
/**
 * @constant {number}
 */
export declare const SYNC_GPU_COMMANDS_COMPLETE = 37143;
/**
 * @constant {number}
 */
export declare const UNSIGNALED = 37144;
/**
 * @constant {number}
 */
export declare const SIGNALED = 37145;
/**
 * @constant {number}
 */
export declare const ALREADY_SIGNALED = 37146;
/**
 * @constant {number}
 */
export declare const TIMEOUT_EXPIRED = 37147;
/**
 * @constant {number}
 */
export declare const CONDITION_SATISFIED = 37148;
/**
 * @constant {number}
 */
export declare const WAIT_FAILED = 37149;
/**
 * @constant {number}
 */
export declare const SYNC_FLUSH_COMMANDS_BIT = 1;
/**
 * @constant {number}
 */
export declare const COLOR = 6144;
/**
 * @constant {number}
 */
export declare const DEPTH = 6145;
/**
 * @constant {number}
 */
export declare const STENCIL = 6146;
/**
 * @constant {number}
 */
export declare const MIN = 32775;
/**
 * @constant {number}
 */
export declare const MAX = 32776;
/**
 * @constant {number}
 */
export declare const DEPTH_COMPONENT24 = 33190;
/**
 * @constant {number}
 */
export declare const STREAM_READ = 35041;
/**
 * @constant {number}
 */
export declare const STREAM_COPY = 35042;
/**
 * @constant {number}
 */
export declare const STATIC_READ = 35045;
/**
 * @constant {number}
 */
export declare const STATIC_COPY = 35046;
/**
 * @constant {number}
 */
export declare const DYNAMIC_READ = 35049;
/**
 * @constant {number}
 */
export declare const DYNAMIC_COPY = 35050;
/**
 * @constant {number}
 */
export declare const DEPTH_COMPONENT32F = 36012;
/**
 * @constant {number}
 */
export declare const DEPTH32F_STENCIL8 = 36013;
/**
 * @constant {number}
 */
export declare const INVALID_INDEX = 4294967295;
/**
 * @constant {number}
 */
export declare const TIMEOUT_IGNORED = -1;
/**
 * @constant {number}
 */
export declare const MAX_CLIENT_WAIT_TIMEOUT_WEBGL = 37447;
/**
 * Describes the frequency divisor used for instanced rendering
 * @constant {number}
 */
export declare const VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE = 35070;
/**
 * Passed to getParameter to get the vendor string of the graphics driver
 * @constant {number}
 */
export declare const UNMASKED_VENDOR_WEBGL = 37445;
/**
 * Passed to getParameter to get the renderer string of the graphics driver
 * @constant {number}
 */
export declare const UNMASKED_RENDERER_WEBGL = 37446;
/**
 * Returns the maximum available anisotropy
 * @constant {number}
 */
export declare const MAX_TEXTURE_MAX_ANISOTROPY_EXT = 34047;
/**
 * Passed to texParameter to set the desired maximum anisotropy for a texture
 * @constant {number}
 */
export declare const TEXTURE_MAX_ANISOTROPY_EXT = 34046;
/**
 * A DXT1-compressed image in an RGB image format
 * @constant {number}
 */
export declare const COMPRESSED_RGB_S3TC_DXT1_EXT = 33776;
/**
 * A DXT1-compressed image in an RGB image format with a simple on/off alpha value
 * @constant {number}
 */
export declare const COMPRESSED_RGBA_S3TC_DXT1_EXT = 33777;
/**
 * A DXT3-compressed image in an RGBA image format. Compared to a 32-bit RGBA texture, it offers 4:1 compression
 * @constant {number}
 */
export declare const COMPRESSED_RGBA_S3TC_DXT3_EXT = 33778;
/**
 * A DXT5-compressed image in an RGBA image format. It also provides a 4:1 compression, but differs to the DXT3 compression in how the alpha compression is done
 * @constant {number}
 */
export declare const COMPRESSED_RGBA_S3TC_DXT5_EXT = 33779;
/**
 * A DXT1-compressed image in an sRGB image format
 * @constant {number}
 */
export declare const COMPRESSED_SRGB_S3TC_DXT1_EXT = 35916;
/**
 * A DXT1-compressed image in an sRGB image format with a simple on/off alpha value
 * @constant {number}
 */
export declare const COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT = 35917;
/**
 * A DXT3-compressed image in an sRGBA image format
 * @constant {number}
 */
export declare const COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT = 35918;
/**
 * A DXT5-compressed image in an sRGBA image format
 * @constant {number}
 */
export declare const COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT = 35919;
/**
 * One-channel (red) unsigned format compression
 * @constant {number}
 */
export declare const COMPRESSED_R11_EAC = 37488;
/**
 * One-channel (red) signed format compression
 * @constant {number}
 */
export declare const COMPRESSED_SIGNED_R11_EAC = 37489;
/**
 * Two-channel (red and green) unsigned format compression
 * @constant {number}
 */
export declare const COMPRESSED_RG11_EAC = 37490;
/**
 * Two-channel (red and green) signed format compression
 * @constant {number}
 */
export declare const COMPRESSED_SIGNED_RG11_EAC = 37491;
/**
 * Compresses RBG8 data with no alpha channel
 * @constant {number}
 */
export declare const COMPRESSED_RGB8_ETC2 = 37492;
/**
 * Compresses RGBA8 data. The RGB part is encoded the same as RGB_ETC2, but the alpha part is encoded separately
 * @constant {number}
 */
export declare const COMPRESSED_RGBA8_ETC2_EAC = 37493;
/**
 * Compresses sRBG8 data with no alpha channel
 * @constant {number}
 */
export declare const COMPRESSED_SRGB8_ETC2 = 37494;
/**
 * Compresses sRGBA8 data. The sRGB part is encoded the same as SRGB_ETC2, but the alpha part is encoded separately
 * @constant {number}
 */
export declare const COMPRESSED_SRGB8_ALPHA8_ETC2_EAC = 37495;
/**
 * Similar to RGB8_ETC, but with ability to punch through the alpha channel, which means to make it completely opaque or transparent
 * @constant {number}
 */
export declare const COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2 = 37496;
/**
 * Similar to SRGB8_ETC, but with ability to punch through the alpha channel, which means to make it completely opaque or transparent
 * @constant {number}
 */
export declare const COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2 = 37497;
/**
 * RGB compression in 4-bit mode. One block for each 4×4 pixels
 * @constant {number}
 */
export declare const COMPRESSED_RGB_PVRTC_4BPPV1_IMG = 35840;
/**
 * RGBA compression in 4-bit mode. One block for each 4×4 pixels
 * @constant {number}
 */
export declare const COMPRESSED_RGBA_PVRTC_4BPPV1_IMG = 35842;
/**
 * RGB compression in 2-bit mode. One block for each 8×4 pixels
 * @constant {number}
 */
export declare const COMPRESSED_RGB_PVRTC_2BPPV1_IMG = 35841;
/**
 * RGBA compression in 2-bit mode. One block for each 8×4 pixels
 * @constant {number}
 */
export declare const COMPRESSED_RGBA_PVRTC_2BPPV1_IMG = 35843;
/**
 * Compresses 24-bit RGB data with no alpha channel
 * @constant {number}
 */
export declare const COMPRESSED_RGB_ETC1_WEBGL = 36196;
/**
 * Compresses RGB textures with no alpha channel
 * @constant {number}
 */
export declare const COMPRESSED_RGB_ATC_WEBGL = 35986;
/**
 * Compresses RGBA textures using explicit alpha encoding (useful when alpha transitions are sharp)
 * @constant {number}
 */
export declare const COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL = 35986;
/**
 * Compresses RGBA textures using interpolated alpha encoding (useful when alpha transitions are gradient)
 * @constant {number}
 */
export declare const COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL = 34798;
/**
 * Compresses RGBA textures using ASTC compression in a blocksize of 4x4
 * @constant {number}
 */
export declare const COMPRESSED_RGBA_ASTC_4X4_KHR = 37808;
/**
 * Compresses RGBA textures using ASTC compression in a blocksize of 5x4
 * @constant {number}
 */
export declare const COMPRESSED_RGBA_ASTC_5X4_KHR = 37809;
/**
 * Compresses RGBA textures using ASTC compression in a blocksize of 5x5
 * @constant {number}
 */
export declare const COMPRESSED_RGBA_ASTC_5X5_KHR = 37810;
/**
 * Compresses RGBA textures using ASTC compression in a blocksize of 6x5
 * @constant {number}
 */
export declare const COMPRESSED_RGBA_ASTC_6X5_KHR = 37811;
/**
 * Compresses RGBA textures using ASTC compression in a blocksize of 6x6
 * @constant {number}
 */
export declare const COMPRESSED_RGBA_ASTC_6X6_KHR = 37812;
/**
 * Compresses RGBA textures using ASTC compression in a blocksize of 8x5
 * @constant {number}
 */
export declare const COMPRESSED_RGBA_ASTC_8X5_KHR = 37813;
/**
 * Compresses RGBA textures using ASTC compression in a blocksize of 8x6
 * @constant {number}
 */
export declare const COMPRESSED_RGBA_ASTC_8X6_KHR = 37814;
/**
 * Compresses RGBA textures using ASTC compression in a blocksize of 8x8
 * @constant {number}
 */
export declare const COMPRESSED_RGBA_ASTC_8X8_KHR = 37815;
/**
 * Compresses RGBA textures using ASTC compression in a blocksize of 10x5
 * @constant {number}
 */
export declare const COMPRESSED_RGBA_ASTC_10X5_KHR = 37816;
/**
 * Compresses RGBA textures using ASTC compression in a blocksize of 10x6
 * @constant {number}
 */
export declare const COMPRESSED_RGBA_ASTC_10X6_KHR = 37817;
/**
 * Compresses RGBA textures using ASTC compression in a blocksize of 10x8
 * @constant {number}
 */
export declare const COMPRESSED_RGBA_ASTC_10X8_KHR = 37818;
/**
 * Compresses RGBA textures using ASTC compression in a blocksize of 10x10
 * @constant {number}
 */
export declare const COMPRESSED_RGBA_ASTC_10X10_KHR = 37819;
/**
 * Compresses RGBA textures using ASTC compression in a blocksize of 12x10
 * @constant {number}
 */
export declare const COMPRESSED_RGBA_ASTC_12X10_KHR = 37820;
/**
 * Compresses RGBA textures using ASTC compression in a blocksize of 12x12
 * @constant {number}
 */
export declare const COMPRESSED_RGBA_ASTC_12X12_KHR = 37821;
/**
 * Compresses SRGB8 textures using ASTC compression in a blocksize of 4x4
 * @constant {number}
 */
export declare const COMPRESSED_SRGB8_ALPHA8_ASTC_4X4_KHR = 37840;
/**
 * Compresses SRGB8 textures using ASTC compression in a blocksize of 5x4
 * @constant {number}
 */
export declare const COMPRESSED_SRGB8_ALPHA8_ASTC_5X4_KHR = 37841;
/**
 * Compresses SRGB8 textures using ASTC compression in a blocksize of 5x5
 * @constant {number}
 */
export declare const COMPRESSED_SRGB8_ALPHA8_ASTC_5X5_KHR = 37842;
/**
 * Compresses SRGB8 textures using ASTC compression in a blocksize of 6x5
 * @constant {number}
 */
export declare const COMPRESSED_SRGB8_ALPHA8_ASTC_6X5_KHR = 37843;
/**
 * Compresses SRGB8 textures using ASTC compression in a blocksize of 6x6
 * @constant {number}
 */
export declare const COMPRESSED_SRGB8_ALPHA8_ASTC_6X6_KHR = 37844;
/**
 * Compresses SRGB8 textures using ASTC compression in a blocksize of 8x5
 * @constant {number}
 */
export declare const COMPRESSED_SRGB8_ALPHA8_ASTC_8X5_KHR = 37845;
/**
 * Compresses SRGB8 textures using ASTC compression in a blocksize of 8x6
 * @constant {number}
 */
export declare const COMPRESSED_SRGB8_ALPHA8_ASTC_8X6_KHR = 37846;
/**
 * Compresses SRGB8 textures using ASTC compression in a blocksize of 8x8
 * @constant {number}
 */
export declare const COMPRESSED_SRGB8_ALPHA8_ASTC_8X8_KHR = 37847;
/**
 * Compresses SRGB8 textures using ASTC compression in a blocksize of 10x5
 * @constant {number}
 */
export declare const COMPRESSED_SRGB8_ALPHA8_ASTC_10X5_KHR = 37848;
/**
 * Compresses SRGB8 textures using ASTC compression in a blocksize of 10x6
 * @constant {number}
 */
export declare const COMPRESSED_SRGB8_ALPHA8_ASTC_10X6_KHR = 37849;
/**
 * Compresses SRGB8 textures using ASTC compression in a blocksize of 10x8
 * @constant {number}
 */
export declare const COMPRESSED_SRGB8_ALPHA8_ASTC_10X8_KHR = 37850;
/**
 * Compresses SRGB8 textures using ASTC compression in a blocksize of 10x10
 * @constant {number}
 */
export declare const COMPRESSED_SRGB8_ALPHA8_ASTC_10X10_KHR = 37851;
/**
 * Compresses SRGB8 textures using ASTC compression in a blocksize of 12x10
 * @constant {number}
 */
export declare const COMPRESSED_SRGB8_ALPHA8_ASTC_12X10_KHR = 37852;
/**
 * Compresses SRGB8 textures using ASTC compression in a blocksize of 12x12
 * @constant {number}
 */
export declare const COMPRESSED_SRGB8_ALPHA8_ASTC_12X12_KHR = 37853;
/**
 * Unsigned integer type for 24-bit depth texture data
 * @constant {number}
 */
export declare const UNSIGNED_INT_24_8_WEBGL = 34042;
/**
 * Half floating-point type (16-bit)
 * @constant {number}
 */
export declare const HALF_FLOAT_OES = 36193;
/**
 * RGBA 32-bit floating-point color-renderable format
 * @constant {number}
 */
export declare const RGBA32F_EXT = 34836;
/**
 * RGB 32-bit floating-point color-renderable format
 * @constant {number}
 */
export declare const RGB32F_EXT = 34837;
/**
 * @constant {number}
 */
export declare const FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE_EXT = 33297;
/**
 * @constant {number}
 */
export declare const UNSIGNED_NORMALIZED_EXT = 35863;
/**
 * Produces the minimum color components of the source and destination colors
 * @constant {number}
 */
export declare const MIN_EXT = 32775;
/**
 * Produces the maximum color components of the source and destination colors
 * @constant {number}
 */
export declare const MAX_EXT = 32776;
/**
 * Unsized sRGB format that leaves the precision up to the driver
 * @constant {number}
 */
export declare const SRGB_EXT = 35904;
/**
 * Unsized sRGB format with unsized alpha component
 * @constant {number}
 */
export declare const SRGB_ALPHA_EXT = 35906;
/**
 * Sized (8-bit) sRGB and alpha formats
 * @constant {number}
 */
export declare const SRGB8_ALPHA8_EXT = 35907;
/**
 * Returns the framebuffer color encoding
 * @constant {number}
 */
export declare const FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING_EXT = 33296;
/**
 * Indicates the accuracy of the derivative calculation for the GLSL built-in functions: dFdx, dFdy, and fwidth
 * @constant {number}
 */
export declare const FRAGMENT_SHADER_DERIVATIVE_HINT_OES = 35723;
/**
 * Framebuffer color attachment point
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT0_WEBGL = 36064;
/**
 * Framebuffer color attachment point
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT1_WEBGL = 36065;
/**
 * Framebuffer color attachment point
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT2_WEBGL = 36066;
/**
 * Framebuffer color attachment point
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT3_WEBGL = 36067;
/**
 * Framebuffer color attachment point
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT4_WEBGL = 36068;
/**
 * Framebuffer color attachment point
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT5_WEBGL = 36069;
/**
 * Framebuffer color attachment point
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT6_WEBGL = 36070;
/**
 * Framebuffer color attachment point
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT7_WEBGL = 36071;
/**
 * Framebuffer color attachment point
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT8_WEBGL = 36072;
/**
 * Framebuffer color attachment point
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT9_WEBGL = 36073;
/**
 * Framebuffer color attachment point
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT10_WEBGL = 36074;
/**
 * Framebuffer color attachment point
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT11_WEBGL = 36075;
/**
 * Framebuffer color attachment point
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT12_WEBGL = 36076;
/**
 * Framebuffer color attachment point
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT13_WEBGL = 36077;
/**
 * Framebuffer color attachment point
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT14_WEBGL = 36078;
/**
 * Framebuffer color attachment point
 * @constant {number}
 */
export declare const COLOR_ATTACHMENT15_WEBGL = 36079;
/**
 * Draw buffer
 * @constant {number}
 */
export declare const DRAW_BUFFER0_WEBGL = 34853;
/**
 * Draw buffer
 * @constant {number}
 */
export declare const DRAW_BUFFER1_WEBGL = 34854;
/**
 * Draw buffer
 * @constant {number}
 */
export declare const DRAW_BUFFER2_WEBGL = 34855;
/**
 * Draw buffer
 * @constant {number}
 */
export declare const DRAW_BUFFER3_WEBGL = 34856;
/**
 * Draw buffer
 * @constant {number}
 */
export declare const DRAW_BUFFER4_WEBGL = 34857;
/**
 * Draw buffer
 * @constant {number}
 */
export declare const DRAW_BUFFER5_WEBGL = 34858;
/**
 * Draw buffer
 * @constant {number}
 */
export declare const DRAW_BUFFER6_WEBGL = 34859;
/**
 * Draw buffer
 * @constant {number}
 */
export declare const DRAW_BUFFER7_WEBGL = 34860;
/**
 * Draw buffer
 * @constant {number}
 */
export declare const DRAW_BUFFER8_WEBGL = 34861;
/**
 * Draw buffer
 * @constant {number}
 */
export declare const DRAW_BUFFER9_WEBGL = 34862;
/**
 * Draw buffer
 * @constant {number}
 */
export declare const DRAW_BUFFER10_WEBGL = 34863;
/**
 * Draw buffer
 * @constant {number}
 */
export declare const DRAW_BUFFER11_WEBGL = 34864;
/**
 * Draw buffer
 * @constant {number}
 */
export declare const DRAW_BUFFER12_WEBGL = 34865;
/**
 * Draw buffer
 * @constant {number}
 */
export declare const DRAW_BUFFER13_WEBGL = 34866;
/**
 * Draw buffer
 * @constant {number}
 */
export declare const DRAW_BUFFER14_WEBGL = 34867;
/**
 * Draw buffer
 * @constant {number}
 */
export declare const DRAW_BUFFER15_WEBGL = 34868;
/**
 * Maximum number of framebuffer color attachment points
 * @constant {number}
 */
export declare const MAX_COLOR_ATTACHMENTS_WEBGL = 36063;
/**
 * Maximum number of draw buffers
 * @constant {number}
 */
export declare const MAX_DRAW_BUFFERS_WEBGL = 34852;
/**
 * The bound vertex array object (VAO)
 * @constant {number}
 */
export declare const VERTEX_ARRAY_BINDING_OES = 34229;
/**
 * The number of bits used to hold the query result for the given target
 * @constant {number}
 */
export declare const QUERY_COUNTER_BITS_EXT = 34916;
/**
 * The currently active query
 * @constant {number}
 */
export declare const CURRENT_QUERY_EXT = 34917;
/**
 * The query result
 * @constant {number}
 */
export declare const QUERY_RESULT_EXT = 34918;
/**
 * A Boolean indicating whether or not a query result is available
 * @constant {number}
 */
export declare const QUERY_RESULT_AVAILABLE_EXT = 34919;
/**
 * Elapsed time (in nanoseconds)
 * @constant {number}
 */
export declare const TIME_ELAPSED_EXT = 35007;
/**
 * The current time
 * @constant {number}
 */
export declare const TIMESTAMP_EXT = 36392;
/**
 * A Boolean indicating whether or not the GPU performed any disjoint operation
 * @constant {number}
 */
export declare const GPU_DISJOINT_EXT = 36795;
/**
 * Query to determine if the compilation process is complete
 * @constant {number}
 */
export declare const COMPLETION_STATUS_KHR = 37297;
