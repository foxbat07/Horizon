// Horizon.js

// essentials
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 120, window.innerWidth/window.innerHeight, 0.1, 10000 );
var renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
const loader = new THREE.TextureLoader();
var perlin = new THREE.ImprovedNoise();

var strDownloadMime = "image/octet-stream";

// set time and clocks
var date = new Date();
var currentTime = date.getTime();

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.gammaInput = true;
renderer.gammaOutput = true;
// renderer.toneMapping = THREE.ReinhardToneMapping;
// renderer.toneMapping = THREE.CineonToneMapping

document.body.appendChild( renderer.domElement );
var trackBallControls = new THREE.TrackballControls( camera, renderer.domElement );

// intialize three
var sphere = new THREE.SphereBufferGeometry( 1, 16, 8 );
var pointLight = new THREE.PointLight( 0xEE77DD, 2, 0 ,2 );
pointLight.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x111111 } ) ) );
scene.add( pointLight );

var ambientLight = new THREE.AmbientLight( 0x606060 ); // soft white light
scene.add( ambientLight );

// var spotLight = new THREE.SpotLight( 0x770000, 2, 1000);
// spotLight.position.set( 0,0,500 );
// spotLight.target.position.set( 0 , 0 , -600 );
// scene.add( spotLight.target );
// spotLight.castShadow = true;
// scene.add( spotLight );

var distantFog = new THREE.FogExp2( controls.fogColor, controls.fogDensity/1000 );

//  cylinder geometry

var cylinderTerrainMaterial = new THREE.MeshLambertMaterial( { color: controls.formColor, emissive: controls.emissiveColor,  side: THREE.DoubleSide, transparent: true, opacity: 1.0, wireframe: false } );
var cylinderTerrainGeometry = new THREE.CylinderGeometry(30,30,600,64,120,true); // - 1 since it uses segments - keeps the math straight // 300,300,2000,100,100
// var cylinderTerrainGeometry = new THREE.CylinderBufferGeometry( 30, 30, 600, 64,120, true );
var cylinderTerrainMesh = new THREE.Mesh( cylinderTerrainGeometry, cylinderTerrainMaterial );
cylinderTerrainMesh.rotateX( - Math.PI / 2 );

var backupGeometry = cylinderTerrainGeometry.clone();

//  plane geometry

var planeTerrainGeometry = new THREE.PlaneBufferGeometry( 600, 600, 64, 64);
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

    scene.fog = distantFog; // new THREE.FogExp2( 0xefaab5, 0.0025 );
    scene.add(cylinderTerrainMesh);
    scene.add(planeTerrainMesh);
}

// threejs animate function

function animate() {
    requestAnimationFrame(animate);
    trackBallControls.update();

    distantFog.color.set(controls.fogColor); // not using Hex on purpose
    distantFog.density = controls.fogDensity/10000;

    var time = Date.now() * 0.0005;
    var time2 =  Date.now() * 0.005;

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
        position = planeTerrainGeometry.attributes.position;
        for ( var i = 0; i < position.count; i ++ ) {
            var CNFrequency = Date.now()/500 * controls.frequency;
            var x = Math.sin(CNFrequency + i/(controls.distortion));
            var y = Math.cos(CNFrequency + i%(controls.distortion));
            var z = 1 - x * y;
            var perlinNoise = controls.frequency * perlin.noise(x, y, z);
            // var height = 10 * Math.sin( i % 5 + ( time2 + i ) / 7 );

            position.setY( i, controls.amplitude * ( 1 + perlinNoise ) );
        }
        planeTerrainGeometry.translate(0,-50,0);
        position.needsUpdate = true;
        planeTerrainGeometry.computeBoundingSphere();
        planeTerrainGeometry.computeVertexNormals();
        planeTerrainGeometry.computeFaceNormals();
    }

    // animate cylinder
    if ( cylinderTerrainMesh.visible == true) {
        for ( var i = 0; i < cylinderTerrainGeometry.vertices.length; i ++ ) {
    
            var CNFrequency = Date.now()/10000 * controls.amplitude;
            var x = 0.5 + 0.5 * Math.sin(CNFrequency + i%controls.distortion);
            var y = 0.5 + 0.5 * Math.cos(CNFrequency + i/controls.distortion);
            var z = x * y / 3;
            var perlinNoise = controls.frequency * perlin.noise(x, y, z);
    
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

window.addEventListener( 'resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

}, false );
