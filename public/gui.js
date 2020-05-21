// gui initialize
var gui = new dat.GUI();

// set time and clocks
var date = new Date();
var currentTime = date.getTime();

var controls = new function() {
    this.takeImage = function(){ saveAsImage() };
    this.researchLink = function() {window.open('https://www.youtube.com/watch?v=EtI7f3Rwqkw')};
    this.backgroundColor = 0xffffff;
    this.form = 'Cylinder';
    this.wireframe = false;
    this.formColor = 0x449911;
    this.emissiveColor = 0x6677DD;
    this.fogDensity = 0;
    this.fogColor = 0x000000;

    this.dynamic = true;
    this.amplitude = 10;
    this.frequency = 0.5;
    this.distortion = 600;
};

var general = gui.addFolder('Horizon Generator');
general.add(controls, 'takeImage').name('Take Screenshot');
general.addColor(controls, 'backgroundColor').name('Background');
general.open();

var f0 = gui.addFolder('Form & Color');
f0.add(controls, 'form', [ 'Cylinder', 'Planes']);
f0.add(controls, 'wireframe').name('Show wireframe');
f0.addColor(controls, 'formColor').name('Form Color');
f0.addColor(controls, 'emissiveColor').name('Emissive Color');
f0.add(controls, 'fogDensity', 0, 10).name('Fog Density');
f0.addColor(controls, 'fogColor').name('Fog Color');
f0.open();

var f1 = gui.addFolder('Cylinder');
f1.add(controls, 'amplitude', 0, 100).name('Amplitude');
f1.add(controls, 'frequency', 0, 1).name('Frequency');
f1.add(controls, 'distortion', 0, 1000).name('Distortion');



// Image saving
function saveAsImage() {
    var imgData;
    try {
        var strMime = "image/jpeg";
        var strDownloadMime = "image/octet-stream";
        imgData = renderer.domElement.toDataURL(strMime);
        var fileName = 'supershape-image-' + currentTime+ '.jpg';
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