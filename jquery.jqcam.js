(function($, options) {
  
  var _$container;
  var _$camFieldset;
  var _$picFieldset;
  var _$croppedFieldset;
  var _$cam;
  var _$pic;
  var _$cropped;
  var _$canvas;
  var _$cropCanvas;
  var _camStream;
  var _browserInfo;
  var _$snapBtn;
  var _$cropBtn;
  var _$processCroppedBtn;
  var _picSnapped;
  var _camOpts;
  
  // cropper dimensions
  var _cropperX = 0;
  var _cropperY = 0;
  var _cropperWidth = 0;
  var _cropperHeight = 0;
  var _selectedArea = null;
  
  //  to request permission to use the camera
  var _mediaConstraints = {
    video: true,
    audio: false
  };
  
  var _defaults = {
    picFormat: 'jpg',
    cropperDimensions: [5, 5, 250, 313],
    cropperSelectable: false,
    cropperResizable: false,
    camWidth: 320,
    camHeight: 240,
    processCroppedFunction: function() {
      alert('Function not defined');
    }
  };
  
  function createElements() {
    _$camFieldset = $('<fieldset id="jqcam-camFS" class="jqcam-fieldset">').append('<legend>Camera</legend>');
    _$picFieldset = $('<fieldset id="jqcam-picFS" class="jqcam-fieldset">').append('<legend>Picture</legend>');
    _$croppedFieldset = $('<fieldset id="jqcam-croppedFS" class="jqcam-fieldset">').append('<legend>Cropped</legend>');
    
    _$snapBtn = $('<button id="jqcam-snapBtn">').text('Snap');
    _$cropBtn = $('<button id="jqcam-cropBtn">').text('Crop');
    _$processCroppedBtn = $('<button id="jqcam-processBtn">').text('Send');
    
    _$cam = $('<video id="jqcam-cam" autoplay muted>');
    _$pic = $('<img id="jqcam-pic" src="" alt="Here will appear the picture"\/>');
    _$cropped = $('<img id="jqcam-cropped" src="" alt="Here will appear the cropped picture"\/>');
    
    _$canvas = $('<canvas id="jqcam-canvas">').appendTo(_$container);
    _$cropCanvas = $('<canvas id="jqcam-cropCanvas">').appendTo(_$container);
    
    _$camFieldset.append(_$cam).append(_$snapBtn).appendTo(_$container); 
    _$picFieldset.append(_$pic).append(_$cropBtn).appendTo(_$container);    
    _$croppedFieldset.append(_$cropped).append(_$processCroppedBtn)
            .appendTo(_$container);
    
    _$container.addClass('jqcam-container');
    
  }

  
  function getBrowserInfo() {
    var ua = navigator.userAgent, tem,
            M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      return { model: 'IE', version: (tem[1] || '') };
    }
    if (M[1] === 'Chrome') {
      tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
      if (tem != null) {
        return { model: tem[1].replace('OPR', 'opera'), version: tem[2] };
      }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null)
      M.splice(1, 1, tem[1]);
    return { model: M[0].toLowerCase(), version: M[1] };
  }
  
  function requestCamSuccessCallback(stream) {
    // expose the stream so that we can close it when changing camera
    _camStream = stream;
    if (_browserInfo.model === 'firefox') {
      _$cam[0].mozSrcObject = stream;
    } else {
      _$cam.attr('src', window.URL.createObjectURL(stream));
    }
    _$cam[0].play();       
  }

  function requestCamErrorCallback(error) {
    alert('Unable to access the camera, make sure it's connected and that it's not being used by another page or application');
    console.error("navigator.getUserMedia error: ", error);
  }
  
  function removeCropper() {
    _$container.find('.jcrop-holder').remove();
    _$pic.css({display:'none',visibility:'visible'})
            .removeData(); // delete Jcrop handlers
  }
  
  function updateCoords(c) {
    _cropperX = c.x;
    _cropperY = c.y;
    _cropperWidth = c.w;
    _cropperHeight = c.h;
    // save cropper position
    _selectedArea = [c.x, c.y, c.w + c.x, c.h + c.y];
  }
  
  function appendCropper() {
    _$pic.Jcrop({
      allowSelect: _camOpts.cropperSelectable,
      allowResize: _camOpts.cropperResizable,
      onChange: updateCoords,
      onSelect: updateCoords,
      // if cropper is at default position leave it there
      setSelect: _selectedArea === null 
        ? _camOpts.cropperDimensions
        : _selectedArea
    });
  }
  
  function clearPicture() {
    _selectedArea = null;
    removeCropper();
    hideCroppedPicture();
    var context = _$canvas[0].getContext('2d');
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, _$canvas.attr('width'), _$canvas.attr('height'));

    var data = _$canvas[0].toDataURL('image/' + _camOpts.picFormat);
    _$pic.attr('src', data);
    _picSnapped = false;
  }

  
  function takePicture() {
    if (_camStream === null || _$cam.prop('videoWidth') === 0) return;
    removeCropper();
    var context = _$canvas[0].getContext('2d');
    if (_camOpts.camWidth && _camOpts.camHeight) {
      _$canvas.attr('width', _camOpts.camWidth);
      _$canvas.attr('height', _camOpts.camHeight);
      context.drawImage(_$cam[0], 0, 0, _camOpts.camWidth, _camOpts.camHeight);

      var data = _$canvas[0].toDataURL('image/' + _camOpts.picFormat);
      _$pic.attr('src', data);

      appendCropper();
      _picSnapped = true;
    } else {
      clearPicture();
    }

  }
  
  function hideCroppedPicture() {
    _$cropped.attr('src', '');
  }
  
  function cropPicture() {
    if (!_picSnapped) return;
    var context = _$canvas[0].getContext('2d');
    var selectedSection = context.getImageData(_cropperX, _cropperY, _cropperWidth, 
      _cropperHeight);
    _$cropCanvas.attr('width', _cropperWidth);
    _$cropCanvas.attr('height', _cropperHeight);
    context = _$cropCanvas[0].getContext('2d');
    context.putImageData(selectedSection, 0, 0);
    var img64 = _$cropCanvas[0].toDataURL('image/' + _camOpts.picFormat);
    _$cropped.attr('src', img64);
  }
  
  function init($container) {    
    _browserInfo = getBrowserInfo();
    
    _$container = $container;
    createElements();
    
    // media alias for x-browser support
    navigator.getMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;

    navigator.getMedia(
      _mediaConstraints, requestCamSuccessCallback, requestCamErrorCallback
    );  
    
    _$snapBtn.click(takePicture);
    _$cropBtn.click(cropPicture);
    _$processCroppedBtn.click(_camOpts.processCroppedFunction); 
    
  }
  
  $.fn.jqcam = function(opts) {
    _camOpts = $.extend(_defaults, opts);
    init($(this));
    return this;
  };
  
})(jQuery);
