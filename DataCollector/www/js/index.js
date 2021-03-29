
document.addEventListener('deviceready', onDeviceReady, false);
document.getElementById("buttonStart").onclick = startFileCreation;
document.getElementById("buttonStop").onclick = stopCamera;
var globalFileEntry = "";
var timeStamp = 0;

var options = {CameraFacing:"back",
canvas: {
    width: 320,height: 240
    },
capture: { 
    width: 320,height: 240
    },
fps:10,
flashMode:true,
onBeforeDraw:function(frame) { 
    timeStamp = Date.now(); 
},
onAfterDraw:function(frame) {
    getAverageRGB(frame.element.getContext("2d"));
    }
};

function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById('deviceready').classList.add('ready');
    var objcanvas = document.getElementById("canvas");
    window.plugin.CanvasCamera.initialize(objcanvas);
}

function startFileCreation(){
    var storageLocation = "";
    if (window.cordova && cordova.platformId !== "browser") {
        switch (device.platform) {
          case "Android":
            console.log("Android");
            storageLocation = cordova.file.externalDataDirectory;
            break;
          case "iOS":
            console.log("IOS");
            storageLocation = cordova.file.documentsDirectory;
            break;
        }

        var folderPath = storageLocation;
        window.resolveLocalFileSystemURL(folderPath,function(dirEntry) {
            console.log('file system open: ' + dirEntry.name);
            var tempName = Date.now();
            console.log(tempName);
            createFile(dirEntry, tempName + ".txt");
            startCamera();
         }, function (err) {
             console.error(err);
         }); 

    }
}
function createFile(dirEntry, fileName) {
    console.log(fileName);
dirEntry.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {
    globalFileEntry = fileEntry;
    console.log("I create file");
    startCamera(fileEntry);


}, function (err) {
    console.error(err);
});

}

function startCamera(fileEntry){
    
    CanvasCamera.start(options,function(){
        console.log("Fel vid start av kamera");

    },function(data){
        
        /* console.log('[CanvasCamera start]', 'data', data); */
        

    });

}


function writeFile(dataObj) {
    var isAppend=true;
    
    globalFileEntry.createWriter(function (fileWriter) {

    fileWriter.onwriteend = function() {
        console.log("Successful file read...");
        readFile();
    };

    fileWriter.onerror = function (e) {
        console.log("Failed file read: " + e.toString());
    };


    if (isAppend) {
        try {
            fileWriter.seek(fileWriter.length);
        }
        catch (e) {
            console.log("file doesn't exist!");
        }
    }
    fileWriter.write(dataObj);
});
}

function readFile() {

globalFileEntry.file(function (file) {
    var reader = new FileReader();

    reader.onloadend = function() {
/*         console.log("Successful file read: " + this.result); */
        displayFileData(globalFileEntry.fullPath + ": " + this.result);
    };

    reader.readAsText(file);
    /* console.log(this.result); */

}, console.log("Fel vid läsning"));
}

function getAverageRGB(frameElement){
    let R = 0;
    let G = 0;
    let B = 0;
    let count = 0;
    imgData = frameElement.getImageData(0, 0, 320, 240);
    let arr = imgData.data;
/*     console.log(arr); */
    let length = imgData.data.length;
/*     console.log(length); */
    let avg = 0;
    for (let i = 0; i< length; i+= 4) {
        count ++;
        R += arr[i];
        G += arr[i +1];
        B += arr[i+2];
    }
    R = (R/count);
    G = (G/count);
    B = (B/count);
    avg = ((R+G+B) / 3);
/*     console.log(avg); */
    dataObj = new Blob([avg+" "+ timeStamp+ "\n"], { type: 'text/plain' });
    writeFile(dataObj);
}
function stopCamera(){
    window.plugin.CanvasCamera.stop(function(error) {
        console.log('[CanvasCamera stop]', 'error', error);
    }, function(data) {
        console.log('[CanvasCamera stop]', 'data', data);
    });
}