// Horizon.js

// essentials
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 90, window.innerWidth/window.innerHeight, 0.1, 10000 );
var renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
const loader = new THREE.TextureLoader();
var perlin = new THREE.ImprovedNoise();

var strDownloadMime = "image/octet-stream";

// set time and clocks
var date = new Date();
var startMillis = date.getMilliseconds();
// var currentTime = date.getTime();
var clock = new THREE.Clock();
clock.start();

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.gammaInput = true;
renderer.gammaOutput = true;

document.body.appendChild( renderer.domElement );
var trackBallControls = new THREE.TrackballControls( camera, renderer.domElement );

// variables
var planeWidth = 1200;
var planeHeight = 1200;
var planeWidthSegments = 63; // 128 -1 since the vertex is one more.
var planeHeightSegments = 63;

var cylinderRadius1 = 30;
var cylinderRadius2 = 30;
var cylinderHeight = 600;
var cylinderRadiusSegments = 64;
var cylinderHeightSegements = 120;

// intialize lights
var sphere = new THREE.SphereBufferGeometry( 16, 16, 16 );
var pointLight = new THREE.PointLight( 0xa0a0a0, 1, 0 ,2 );
pointLight.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xdddddd } ) ) );
scene.add( pointLight );

var ambientLight = new THREE.AmbientLight( controls.ambientLightColor, controls.ambientLightIntensity ); // soft white light
scene.add( ambientLight );

var distantFog = new THREE.FogExp2( controls.fogColor, controls.fogDensity/1000 );

//  cylinder geometry
var cylinderTerrainMaterial = new THREE.MeshLambertMaterial( { color: controls.formColor, emissive: controls.emissiveColor,  side: THREE.DoubleSide, transparent: true, opacity: 1.0, wireframe: false } );
var cylinderTerrainGeometry = new THREE.CylinderGeometry(cylinderRadius1,cylinderRadius2,cylinderHeight,cylinderRadiusSegments,cylinderHeightSegements,true); // - 1 since it uses segments - keeps the math straight // 300,300,2000,100,100
// var cylinderTerrainGeometry = new THREE.CylinderBufferGeometry( 30, 30, 600, 64,120, true );
var cylinderTerrainMesh = new THREE.Mesh( cylinderTerrainGeometry, cylinderTerrainMaterial );
cylinderTerrainMesh.rotateX( - Math.PI / 2 );
var backupGeometry = cylinderTerrainGeometry.clone();

//  plane geometry
var planeTerrainGeometry = new THREE.PlaneBufferGeometry(planeWidth, planeHeight, planeWidthSegments, planeHeightSegments);
planeTerrainGeometry.rotateX( - Math.PI / 2 );

var position = planeTerrainGeometry.attributes.position;
position.usage = THREE.DynamicDrawUsage;
var planeTerrainMesh = new THREE.Mesh( planeTerrainGeometry, cylinderTerrainMaterial );
// start
init();
animate();

// threejs init function
function init(){
    camera.position.set(0,0,300);
    trackBallControls.rotateSpeed = 4;
    trackBallControls.zoomSpeed = 1;

    scene.fog = distantFog;
    scene.add(cylinderTerrainMesh);
    scene.add(planeTerrainMesh);
}

// threejs animate function
function animate() {
    requestAnimationFrame(animate);
    trackBallControls.update();

    ambientLight.color.set(controls.ambientLightColor);
    ambientLight.intensity = controls.ambientLightIntensity;
    
    distantFog.color.set(controls.fogColor); // not using Hex on purpose
    distantFog.density = controls.fogDensity/10000;

    var time = Date.now() * 0.0005;

    pointLight.position.x = 60 - Math.sin( time * 0.7 ) * 120;
    pointLight.position.y = 60 - Math.cos( time * 0.5 ) * 120;
    pointLight.position.z = 200 - Math.cos( time * 0.3 ) * 400;


    if ( controls.form == 'Cylinder' ) {
        cylinderTerrainMesh.visible = true;
        planeTerrainMesh.visible = false;
    }
    else {
        planeTerrainMesh.visible = true;
        cylinderTerrainMesh.visible = false;
    }

    // animate plane
    if ( planeTerrainMesh.visible == true ) {
        var data = generateTerrain( planeWidthSegments+1 , planeHeightSegments+1)
        var vertices = planeTerrainGeometry.attributes.position.array;

        for ( var i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
            vertices[j + 1] = data[i];
        }

        vertices.needsUpdate = true;
        planeTerrainGeometry.translate(0,-50,0);
        planeTerrainGeometry.computeBoundingSphere();
        planeTerrainGeometry.computeVertexNormals();
        planeTerrainGeometry.computeFaceNormals();
    }

    // animate cylinder
    if ( cylinderTerrainMesh.visible == true) {
        for ( var i = 0; i < cylinderTerrainGeometry.vertices.length; i ++ ) {
    
            var CNFrequency = Date.now()/10000 * controls.frequency;
            var x = 0.5 + 0.5 * Math.sin(CNFrequency + i%controls.distortion);
            var y = 0.5 + 0.5 * Math.cos(CNFrequency + i/controls.distortion);
            var z = x * y / 3;
            var perlinNoise = controls.amplitude * perlin.noise(x, y, z);
    
            cylinderTerrainGeometry.vertices[i].x = backupGeometry.vertices[i].x * (1 + perlinNoise);
            cylinderTerrainGeometry.vertices[i].z = backupGeometry.vertices[i].z * (1 + perlinNoise);
        }
        
        cylinderTerrainGeometry.verticesNeedUpdate = true;
        cylinderTerrainGeometry.computeVertexNormals();
        cylinderTerrainGeometry.computeFaceNormals();
    }

    cylinderTerrainMaterial.wireframe = controls.wireframe;
    cylinderTerrainMaterial.color.set(controls.formColor);
    cylinderTerrainMaterial.emissive.set(controls.emissiveColor);

    render();
};

// threejs render function
function render() { 
    
    scene.background = new THREE.Color(controls.backgroundColor);

    renderer.render( scene, camera );
}


function generateTerrain( ws, hs  ) {
    var size = ws * hs
    var data = new Uint8Array( size ), quality = 1;
    for ( var j = 0; j < 5; j ++ ) {
        for ( var i = 0; i < size; i ++ ) {
            var x = i % ws + controls.distortion * startMillis * 0.0001;
            var y = (parseInt(i/ws))/hs + controls.distortion * startMillis * 0.0001;
            var z = perlin.noise(x,y,i * startMillis/1000); //startMillis helps keep things random on each initialize
            data[ i ] += controls.roughness * quality * Math.abs( perlin.noise( x/ quality, y/quality,z ));
        }
        quality *= 3;
    }

    if(controls.dynamic) {
        // var modulate = clock.getElapsedTime() * controls.frequency ;
        var modulate = Date.now()* 0.000001 * controls.frequency;
        var modulateFactor = 10;
        for ( var i = 0; i < size; i ++ ) {
            var x = i % ws
            var y = (parseInt(i/ws))/hs;
            var z = perlin.noise(i * modulate, x, y);
            data[ i ] += controls.amplitude * Math.abs( perlin.noise( modulateFactor * Math.sin(modulate), modulateFactor * Math.cos(modulate), z )) ;
        }
    }
    return data;
}

window.addEventListener( 'resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

}, false );
