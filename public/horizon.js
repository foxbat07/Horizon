// Horizon.js

// essentials
var gui = new dat.GUI();
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 100000 );
var renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
const loader = new THREE.TextureLoader();
var spriteMap = loader.load("assets/circle-64.png" );
const skyBoxTexture = loader.load('assets/outrun-small3.jpg');

var perlin = new THREE.ImprovedNoise();
var strDownloadMime = "image/octet-stream";

// set time and clocks
var date = new Date();

var currentTime = date.getTime();
var clock = new THREE.Clock();
clock.start();


renderer.setSize( window.innerWidth, window.innerHeight );
renderer.gammaInput = true;
renderer.gammaOutput = true;
// renderer.toneMapping = THREE.ReinhardToneMapping;
document.body.appendChild( renderer.domElement );

var trackBallControls = new THREE.TrackballControls( camera, renderer.domElement );

// dat.gui

// intialize three

var cylinderTerrainMaterial = new THREE.MeshBasicMaterial( { color: 'cyan', side: THREE.DoubleSide, transparent: true, opacity: 1.0, wireframe: true } );
var cylinderTerrainGeometry = new THREE.CylinderGeometry(20,20,200,30,30,true); // - 1 since it uses segments - keeps the math straight // 300,300,2000,100,100
var cylinderTerrainMesh = new THREE.Mesh( cylinderTerrainGeometry, cylinderTerrainMaterial );

var backupGeometry = cylinderTerrainGeometry.clone();

// cylinderTerrainMesh.rotateX( - Math.PI / 2 );

// generate terrain

function deformCylinder(verticesLength) {
    //generate cylinder terrain
    var k = 1;
    var startMillis = date.getMilliseconds();
    var vertices = [];
    var modulate = clock.getElapsedTime() / 5000;
    var modulateFactor = 0.001;

    for ( var i = 0; i < verticesLength; i ++ ) {
        // var noiseX = (1 + k * perlin.noise(i%2, i%5, i/17 * startMillis) * Math.sin(startMillis));
        // var noiseZ = (1 + k * perlin.noise(i/13, i%11 , i%3 * startMillis) * Math.cos(startMillis)) ;

        // var sx = Math.cos(startMillis * 100 * i);
        // var sz = Math.sin(startMillis * 100 * i);

        // var x = cylinderTerrainGeometry.vertices[i].x * sx;
        // var y = cylinderTerrainGeometry.vertices[i].y;
        // var z = cylinderTerrainGeometry.vertices[i].z * sz;
        
        var x = 2 + i % 17
        var y = 3 + i%5;
        var z = perlin.noise(i * modulate , x, y);

        var sx =  perlin.noise( modulateFactor * Math.sin(startMillis * modulate) * x , modulateFactor * Math.cos(startMillis * modulate) * y , z );
        var sz =  perlin.noise( modulateFactor * Math.cos(startMillis * modulate) * y, modulateFactor * Math.sin(startMillis * modulate) * x , z );

        vertices.push(new THREE.Vector3(0.1 * sx, 0, 0.1 * sz));
    }

    return vertices;
}

// trigger threejs function starts

init();
animate();

// threejs init function

function init(){

    camera.position.set(0,0,1);
    
    trackBallControls.rotateSpeed = 4;
    trackBallControls.zoomSpeed = 1;

    scene.add( cylinderTerrainMesh );
}

// threejs animate function

function animate() {
    requestAnimationFrame(animate);

    // cylinderTerrainGeometry = backupGeometry;
    //generate cylinder terrain
    var newCylinderVertices = deformCylinder(cylinderTerrainGeometry.vertices.length);
    // cylinderTerrainGeometry.vertices = newCylinderVertices;
    for ( var i = 0; i < cylinderTerrainGeometry.vertices.length; i ++ ) {
        var startMillis = date.getMilliseconds();
        var CNFrequency = clock.getElapsedTime() / 10000;
        var CNAmplitude = 0.25;

        var x = 2 + i % 17
        var y = 3 + i%5;
        var z = perlin.noise(i * CNFrequency , x, y);

        // var sx =  perlin.noise( CNAmplitude * Math.sin(CNFrequency) * x , CNAmplitude * Math.cos(CNFrequency) * y , z );
        // var sz =  perlin.noise( CNAmplitude * Math.cos(CNFrequency) * y, CNAmplitude * Math.sin(CNFrequency) * x , z );
        
        var perlinNoise = CNAmplitude * perlin.noise( Math.cos(startMillis * CNFrequency) * y, Math.sin( startMillis * CNFrequency) * x , z );

        cylinderTerrainGeometry.vertices[i].x = backupGeometry.vertices[i].x * (1 + perlinNoise);
        cylinderTerrainGeometry.vertices[i].z = backupGeometry.vertices[i].z * (1 + perlinNoise);
    }

    cylinderTerrainGeometry.verticesNeedUpdate = true;
    trackBallControls.update();
    render();
};

// threejs render function

function render() { 
    renderer.render( scene, camera );
}

window.addEventListener( 'resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

}, false );
