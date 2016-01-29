# jQueryWebcam
A jQuery plugin that allows taking pictures with a webcam

Requires jQuery and Jcrop (http://deepliquid.com/content/Jcrop.html)

## Usage
Imports:
```
<link rel="stylesheet" href="css/jquery.Jcrop.css" type="text/css"/>
<link rel="stylesheet" href="css/jquery.jqcam.css" type="text/css"/>

<script src="js/jquery.js"></script>
<script src="js/jquery.Jcrop.js"></script>
<script src="js/jquery.jqcam.js"></script>
```

Html element (container):
```
<div id="cam"></div>
```

Invocation:
```
$('#cam').jqcam({
    camWidth: 640,
    camHeight: 480
    // further options
});
```

## Options
Options are provided as an object when calling jqcam

* `picFormat` picture export format. Default is `jpg`.
* `cropperDimensions` an array with 4 numbers representing the area covered by the cropper. Default is `[5, 5, 250, 313]`.
* `cropperSelectable` wether the user will be able to define a new cropper area themselves. Default is `false`.
* `cropperResizable` wether the user will be able to resize the original or user defined cropper area. Default is `false`.
* `camWidth` width of the camera feed. Default is `320`
* `camHeight` height of the camera feed. Default is `240`
* `processCroppedFunction` a function that will be called when the user clicks the button of the cropped picture. Default just alerts that the function was not specified.

## References
* http://blog.teamtreehouse.com/accessing-the-device-camera-with-getusermedia
* http://www.html5rocks.com/en/tutorials/getusermedia/intro/
* https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Taking_still_photos
