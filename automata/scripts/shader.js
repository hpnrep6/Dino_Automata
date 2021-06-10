
import { ShaderSprite2DRenderer } from "../../z0/graphics/shadersprite2d.js";
import { getGL, getCanvas } from "../../z0/z0.js";

/**
 * From https://www.shadertoy.com/view/Mdf3z7
 * 
 */

const sponge = `

precision highp float;
varying vec2 vTexCoord;
varying float vAlpha;
uniform sampler2D uSampler;
uniform mediump vec2 uRes;
uniform mediump float uTime;
uniform mediump float uTimeDelta;
uniform vec2 uTranslate;
uniform float uScale;
uniform float uRot;

#define MaxSteps 30
#define MinimumDistance 0.0009
#define normalDistance     0.0002

#define Iterations 7
#define PI 3.141592
#define Scale 3.0
#define FieldOfView 1.0
#define Jitter 0.05
#define FudgeFactor 0.7
#define NonLinearPerspective 2.0
#define DebugNonlinearPerspective false

#define Ambient 0.32184
#define Diffuse 0.5
#define LightDir vec3(1.0)
#define LightColor vec3(00,0.1,1.0)
#define LightDir2 vec3(1.0,-1.0,1.0)
#define LightColor2 vec3(0.1,0.333333,1.0)
#define Offset vec3(0.92858,0.92858,0.32858)

vec2 rotate(vec2 v, float a) {
	return vec2(cos(a)*v.x + sin(a)*v.y, -sin(a)*v.x + cos(a)*v.y);
}

// Two light sources. No specular 
vec3 getLight(in vec3 color, in vec3 normal, in vec3 dir) {
	vec3 lightDir = normalize(LightDir);
	float diffuse = max(0.0,dot(-normal, lightDir)); // Lambertian
	
	vec3 lightDir2 = normalize(LightDir2);
	float diffuse2 = max(0.0,dot(-normal, lightDir2)); // Lambertian
	
	return
	(diffuse*Diffuse)*(LightColor*color) +
	(diffuse2*Diffuse)*(LightColor2*color);
}


// DE: Infinitely tiled Menger IFS.
//
// For more info on KIFS, see:
// http://www.fractalforums.com/3d-fractal-generation/kaleidoscopic-%28escape-time-ifs%29/
float DE(in vec3 z)
{
	// enable this to debug the non-linear perspective
	if (DebugNonlinearPerspective) {
		z = fract(z);
		float d=length(z.xy-vec2(0.5));
		d = min(d, length(z.xz-vec2(0.5)));
		d = min(d, length(z.yz-vec2(0.5)));
		return d-0.01;
	}
	// Folding 'tiling' of 3D space;
	z  = abs(1.0-mod(z,2.0));

	float d = 1000.0;
	for (int n = 0; n < Iterations; n++) {
		z.xy = rotate(z.xy,4.0+2.0*cos( uTime/8.0));		
		z = abs(z);
		if (z.x<z.y){ z.xy = z.yx;}
		if (z.x< z.z){ z.xz = z.zx;}
		if (z.y<z.z){ z.yz = z.zy;}
		z = Scale*z-Offset*(Scale-1.0);
		if( z.z<-0.5*Offset.z*(Scale-1.0))  z.z+=Offset.z*(Scale-1.0);
		d = min(d, length(z) * pow(Scale, float(-n)-1.0));
	}
	
	return d-0.001;
}

// Finite difference normal
vec3 getNormal(in vec3 pos) {
	vec3 e = vec3(0.0,normalDistance,0.0);
	
	return normalize(vec3(
			DE(pos+e.yxx)-DE(pos-e.yxx),
			DE(pos+e.xyx)-DE(pos-e.xyx),
			DE(pos+e.xxy)-DE(pos-e.xxy)
			)
		);
}

// Solid color 
vec3 getColor(vec3 normal, vec3 pos) {
	return vec3(1.0);
}


// Pseudo-random number
// From: lumina.sourceforge.net/Tutorials/Noise.html
float rand(vec2 co){
	return fract(cos(dot(co,vec2(4.898,7.23))) * 23421.631);
}

vec4 rayMarch(in vec3 from, in vec3 dir, in vec2 fragCoord) {
	// Add some noise to prevent banding
	float totalDistance = Jitter*rand(fragCoord.xy+vec2(uTime));
	vec3 dir2 = dir;
	float distance;
	int steps = 0;
	vec3 pos;
	for (int i=0; i < MaxSteps; i++) {
		// Non-linear perspective applied here.
		dir.zy = rotate(dir2.zy,totalDistance*cos( uTime/4.0)*NonLinearPerspective);
		
		pos = from + totalDistance * dir;
		distance = DE(pos)*FudgeFactor;
		totalDistance += distance;
		if (distance < MinimumDistance) break;
		steps = i;
	}
	
	// 'AO' is based on number of steps.
	// Try to smooth the count, to combat banding.
	float smoothStep =   float(steps) + distance/MinimumDistance;
	float ao = 1.1-smoothStep/float(MaxSteps);
	
	// Since our distance field is not signed,
	// backstep when calc'ing normal
	vec3 normal = getNormal(pos-dir*normalDistance*3.0);
	
	vec3 color = getColor(normal, pos);
	vec3 light = getLight(color, normal, dir);
	color = (color*Ambient+light)*ao;
	return vec4(color,1.0);
}

void main( )
{
	// Camera position (eye), and camera target
	vec3 camPos = 0.5*uTime*vec3(1.0,0.0,0.0);
	vec3 target = camPos + vec3(1.0,0.0*cos(uTime),0.0*sin(0.4*uTime));
	vec3 camUp  = vec3(0.0,1.0,0.0);
	
	// Calculate orthonormal camera reference system
	vec3 camDir   = normalize(target-camPos); // direction for center ray
	camUp = normalize(camUp-dot(camDir,camUp)*camDir); // orthogonalize
	vec3 camRight = normalize(cross(camDir,camUp));
	
	vec2 coord =-1.0+2.0*gl_FragCoord.xy/uRes.xy;
	coord.x *= uRes.x/uRes.y;
	
	// Get direction for this pixel
	vec3 rayDir = normalize(camDir + (coord.x*camRight + coord.y*camUp)*FieldOfView);
	
	gl_FragColor = rayMarch(camPos, rayDir, gl_FragCoord.xy);
}
`;

const mengar = `
const float RAY_STOP_TRESHOLD = 0.001;
const int MENGER_ITERATIONS = 5;

float maxcomp(vec2 v) { return max(v.x, v.y); }

float sdCross(vec3 p) {
	p = abs(p);
	vec3 d = vec3(max(p.x, p.y),
				  max(p.y, p.z),
				  max(p.z, p.x));
	return min(d.x, min(d.y, d.z)) - (1.0 / 3.0);
}

float sdCrossRep(vec3 p) {
	vec3 q = mod(p + 1.0, 2.0) - 1.0;
	return sdCross(q);
}

float sdCrossRepScale(vec3 p, float s) {
	return sdCrossRep(p * s) / s;	
}

float scene(vec3 p) {
	float scale = 1.0;
	float dist = 0.0;
	for (int i = 0; i < MENGER_ITERATIONS; i++) {
		dist = max(dist, -sdCrossRepScale(p, scale));
		scale *= 3.0;
	}
	return dist;
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec4 colorize(float c) {
	
	float hue = mix(0.6, 1.15, min(c * 1.2 - 0.05, 1.0));
	float sat = 1.0 - pow(c, 4.0);
	float lum = c;
	vec3 hsv = vec3(hue, sat, lum);
	vec3 rgb = hsv2rgb(hsv);
	return vec4(rgb, 1.0);	
}


void main()
{
	vec2 screenPos = gl_FragCoord.xy / uRes.xy * 2.0 - 1.0;
	
	vec3 cameraPos = vec3(0.3 * sin(uTime / 5.), 0.3 * cos(uTime / 5.), uTime / 2.5);
	//vec3 cameraPos = vec3(0.0);
	vec3 cameraDir = vec3(0.0, 0.0, 1.0);
	vec3 cameraPlaneU = vec3(1.0, 0.0, 0.0);
	vec3 cameraPlaneV = vec3(0.0, 1.0, 0.0) * (uRes.y / uRes.x);

	vec3 rayPos = cameraPos;
	vec3 rayDir = cameraDir + screenPos.x * cameraPlaneU + screenPos.y * cameraPlaneV;
	
	rayDir = normalize(rayDir);
	
	float dist = scene(rayPos);
	int stepsTaken;
    int MAX_RAY_STEPS = int((cos(uTime)+1.1) * 50.);
    
	for (int i = 0; i < 64; i++) {
		if (dist < RAY_STOP_TRESHOLD) {
			continue;
		}
		rayPos += rayDir * dist;
		dist = scene(rayPos);
		stepsTaken = i;
	}
	
	vec4 color = colorize(pow(float(stepsTaken) / float(MAX_RAY_STEPS), 0.9));
	
	gl_FragColor = color;
}
`;

export class Sponge extends ShaderSprite2DRenderer {
    constructor() {
        super(getGL(), getCanvas(), null, ShaderSprite2DRenderer.appendDefault(mengar));
    }
}
