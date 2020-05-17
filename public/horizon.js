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

var sphere = new THREE.SphereBufferGeometry( 0.5, 16, 8 );
var pointLight = new THREE.PointLight( 0xEE77DD, 2, 0 ,2 );
pointLight.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xff0040 } ) ) );
// scene.add( ligpointLightht1 );
// pointLight.position.set( 0,0,0 );
// pointLight.castShadow = true;
scene.add( pointLight );

// var spotLight = new THREE.SpotLight( 0xFF0000, 2);
// spotLight.position.set( 0,0,0 );
// spotLight.target.position.set( 100, -50, 0 );
// spotLight.castShadow = true;
// scene.add( spotLight.target );
// scene.add( spotLight );



var cylinderTerrainMaterial = new THREE.MeshLambertMaterial( { color: 0x449911, emissive: 0x6677DD,  side: THREE.DoubleSide, transparent: true, opacity: 1.0, wireframe: false } );
var cylinderTerrainGeometry = new THREE.CylinderGeometry(20,20,200,30,30,true); // - 1 since it uses segments - keeps the math straight // 300,300,2000,100,100
var cylinderTerrainMesh = new THREE.Mesh( cylinderTerrainGeometry, cylinderTerrainMaterial );
cylinderTerrainMesh.rotateX( - Math.PI / 2 );

var backupGeometry = cylinderTerrainGeometry.clone();

// var cylinderTerrainGeometry2 = new THREE.CylinderGeometry(20,20,200,30,30,true);
// var quadGeometry = makeQuadLines(cylinderTerrainGeometry2);
// quadGeometry.addAttribute("position", new THREE.Vector3(0,0,0));
// var quadMaterial = new THREE.MeshBasicMaterial( { color: 'red', side: THREE.DoubleSide, transparent: true, opacity: 1.0, wireframe: true } );
// var quadMesh = new THREE.LineSegments( quadGeometry, quadMaterial );

// var backupQuadGeometry = quadGeometry.clone();

// quadMesh.rotateX( - Math.PI / 2 );

// trigger threejs function starts

init();
animate();

// threejs init function

function init(){
    camera.position.set(0,0,100);
    trackBallControls.rotateSpeed = 4;
    trackBallControls.zoomSpeed = 1;

    scene.add(cylinderTerrainMesh);
}

// threejs animate function

function animate() {
    requestAnimationFrame(animate);
    trackBallControls.update();
    scene.background = new THREE.Color(0x6699cc);

    var time = Date.now() * 0.0005;
    pointLight.position.x = Math.sin( time * 0.7 ) * 30;
    pointLight.position.y = Math.cos( time * 0.5 ) * 40;
    pointLight.position.z = Math.cos( time * 0.3 ) * 30;


    // cylinderTerrainGeometry.vertices = newCylinderVertices;
    for ( var i = 0; i < cylinderTerrainGeometry.vertices.length; i ++ ) {
        // var startMillis = date.getMilliseconds();
        var CNFrequency = Date.now() * 0.0005;
        var CNAmplitude = 0.5;
        var CNDistortion = 600;

        var x = 0.5 + 0.5 * Math.sin(CNFrequency + i%CNDistortion);
        var y = 0.5 + 0.5 * Math.cos(CNFrequency + i/CNDistortion);
        var z = x * y / 3; //perlin.noise(x, y, x * y);

        var perlinNoise = CNAmplitude * perlin.noise(x, y, z);

        cylinderTerrainGeometry.vertices[i].x = backupGeometry.vertices[i].x * (1 + perlinNoise);
        cylinderTerrainGeometry.vertices[i].z = backupGeometry.vertices[i].z * (1 + perlinNoise);
    }

    cylinderTerrainGeometry.verticesNeedUpdate = true;
    cylinderTerrainGeometry.computeVertexNormals();
    cylinderTerrainGeometry.computeFaceNormals();
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
