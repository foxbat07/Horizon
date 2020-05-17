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

cylinderTerrainMesh.rotateX( - Math.PI / 2 );

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

    // cylinderTerrainGeometry.vertices = newCylinderVertices;
    for ( var i = 0; i < cylinderTerrainGeometry.vertices.length; i ++ ) {
        var startMillis = date.getMilliseconds();
        var CNFrequency = clock.getElapsedTime() / 10000;
        var CNAmplitude = 0.25;

        var x = 2 + i % 17
        var y = 3 + i%5;
        var z = perlin.noise(i * CNFrequency , x, y);

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
