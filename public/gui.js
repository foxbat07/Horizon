// gui initialize
var gui = new dat.GUI();

// set time and clocks
var date = new Date();
var currentTime = date.getTime();

var controls = new function() {
    this.takeImage = function(){ saveAsImage() };
    this.researchLink = function() {window.open('https://www.youtube.com/watch?v=EtI7f3Rwqkw')};
    this.backgroundColor = 0x006278;
    this.ambientLightColor = 0x404040;
    this.ambientLightIntensity = 1;
    this.fogDensity = 0;
    this.fogColor = 0xe691e6;

    this.form = 'Plane';
    this.wireframe = false;
    this.formColor = 0xffffff;
    this.emissiveColor = 0x001625;
    this.roughness = 2;

    this.dynamic = false;
    this.amplitude = 20;
    this.frequency = 0.5;
    this.distortion = 20;
};

var general = gui.addFolder('Horizon Generator');
general.add(controls, 'takeImage').name('Take Screenshot');
general.addColor(controls, 'backgroundColor').name('Background');

general.addColor(controls, 'ambientLightColor').name('Ambient Light');
general.add(controls, 'ambientLightIntensity', 0, 5).name('Ambient Intensity');

general.add(controls, 'fogDensity', 0, 100).name('Fog Density');
general.addColor(controls, 'fogColor').name('Fog Color');

general.close();

var f0 = gui.addFolder('Form & Color');
f0.add(controls, 'form', [ 'Cylinder', 'Plane']);
f0.add(controls, 'wireframe').name('Show wireframe');
f0.addColor(controls, 'formColor').name('Form Color');
f0.addColor(controls, 'emissiveColor').name('Emissive Color');
f0.add(controls, 'roughness', 0,5).name('Terrain Roughness');

f0.open();

var f1 = gui.addFolder('Dynamic');
f1.add(controls, 'dynamic').name('Dynamic');
f1.add(controls, 'amplitude', 0, 100).name('Amplitude');
f1.add(controls, 'frequency', 0, 1).name('Frequency');
f1.add(controls, 'distortion', 1, 100).name('Distortion');
f1.open();


// Image saving
function saveAsImage() {
    var imgData;
    try {
        var strMime = "image/jpeg";
        var strDownloadMime = "image/octet-stream";
        imgData = renderer.domElement.toDataURL(strMime);
        var fileName = 'horizon-image-' + currentTime+ '.jpg';
        saveFile(imgData.replace(strMime, strDownloadMime), fileName);
    } catch (e) {
        console.log(e);
        return;
    }
}

var saveFile = function (strData, filename) {
    var link = document.createElement('a');
    if (typeof link.download === 'string') {
        document.body.appendChild(link); //Firefox requires the link to be in the body
        link.download = filename;
        link.href = strData;
        link.click();
        document.body.removeChild(link); //remove the link when done
    } else {
        location.replace(uri);
    }
}