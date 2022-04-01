// declare global {
interface Window { stream: MediaStream; }
// }

var video = document.querySelector('video')!;
var photo: HTMLCanvasElement = document.getElementById('photo')! as HTMLCanvasElement;
var photoContext = photo.getContext('2d')!;
var snapBtn = document.getElementById('snap')!;
let requestbutton = document.getElementById('requestbutton')!;
var photoContextW: number;
var photoContextH: number;
var pan: number;
let panMax: number;
let panMin: number;
let panInc: number;
var tilt: number;
let tiltMax: number;
let tiltMin: number;
let tiltInc: number;
var zoom: number;
let zoomMax: number;
let zoomMin: number;
let zoomInc: number;
let track: MediaStreamTrack[]
let stream: MediaStream

// attach event handlers
snapBtn.addEventListener('click', snapPhoto);
requestbutton.addEventListener('click', requestDevice)

function grabWebCamVideo() {
    console.log('Getting user media (video) ...');
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {zoom: true, pan: true}
    })
    .then(gotStream)
    .catch(function(e) {
      alert('getUserMedia() error: ' + e.name);
    });

    listDevices();  // fio
}

function gotStream(stream: MediaStream) {
    console.log('getUserMedia video stream URL:', stream);

    window.stream = stream; // stream available to console
    video.srcObject = stream;
    video.onloadedmetadata = function() {
        photo.width = photoContextW = video.videoWidth;
        photo.height = photoContextH = video.videoHeight;
        console.log('gotStream with width and height:', photoContextW, photoContextH);
    };

    addPtzControls(stream);
}

function snapPhoto() {
    photoContext.drawImage(video, 0, 0, photo.width, photo.height);
}

function addPtzControls(stream1: MediaStream) {
  stream = stream1
// this also works
// const [track] = stream.getVideoTracks();
  track = stream.getVideoTracks();
  const capabilities = track[0].getCapabilities();
  const settings = track[0].getSettings();
  console.log(track)
  console.log(capabilities)
  console.log(settings)

  // Check whether pan is supported or not.
  if (!('pan' in track[0].getSettings())) {
    return Promise.reject('Pan is not supported by ' + track[0].label);
  }
  // Check whether tilt is supported or not.
  if (!('tilt' in track[0].getSettings())) {
    return Promise.reject('Tilt is not supported by ' + track[0].label);
  }
  // Check whether zoom is supported or not.
  if (!('zoom' in track[0].getSettings())) {
    return Promise.reject('Zoom is not supported by ' + track[0].label);
  }
  
  pan = settings.pan ?? 0
  panMax = capabilities.pan.max;
  panMin = capabilities.pan.min;
  panInc = capabilities.pan.step;
  tilt = settings.tilt ?? 0
  tiltMax = capabilities.tilt.max;
  tiltMin = capabilities.tilt.min;
  tiltInc = capabilities.tilt.step;
  zoom = settings.zoom ?? 0
  zoomMax = capabilities.zoom.max;
  zoomMin = capabilities.zoom.min;
  zoomInc = capabilities.zoom.step;

  //usingSlider()
}

function moveleft() {
  // fully left = -360000
  pan = pan - panInc
  pan = pan < panMin ? panMin : pan
  track[0].applyConstraints({advanced: [ {pan: pan} ]});
}

function moveup() {
  // fully up = +360000
  tilt = tilt + tiltInc
  console.log('Up: ' + tilt)
  tilt = tilt > tiltMax ? tiltMax : tilt
  track[0].applyConstraints({advanced: [ {tilt: tilt} ]});
}

function movedown() {
  // fully down = -360000
  tilt = tilt - tiltInc
  console.log('Down: ' + tilt)
  tilt = tilt < tiltMin ? tiltMin : tilt
  track[0].applyConstraints({advanced: [ {tilt: tilt} ]});
}

function moveright() {
  // fully right = +360000
  pan = pan + panInc
  pan = pan > panMax ? panMax : pan
  track[0].applyConstraints({advanced: [ {pan: pan} ]});
}

function zoomin() {
  // fully in = +16384
  // zoom = zoom + zoomInc
  zoom = zoom + 500
  console.log('In: ' + zoom)
  zoom = zoom > zoomMax ? zoomMax : zoom
  track[0].applyConstraints({advanced: [ {zoom: zoom} ]});
}

function zoomout() {
  // fully out = 0
  // zoom = zoom - zoomInc
  zoom = zoom - 500
  console.log('Out: ' + zoom)
  zoom = zoom < zoomMin ? zoomMin : zoom
  track[0].applyConstraints({advanced: [ {zoom: zoom} ]});
}

function usingSlider() {
  // use with input type:
  // <input id="zoom" type="range" hidden>
  const slider = document.getElementById('zoom')!;

  // Check whether zoom is supported or not.
  if (!('zoom' in track[0].getSettings())) {
    return Promise.reject('Zoom is not supported by ' + track[0].label);
  }

  // Map zoom to a slider element.
  let capabilities = track[0].getCapabilities()
  slider.min = capabilities.zoom.min;
  slider.max = capabilities.zoom.max;
  slider.step = capabilities.zoom.step;
  slider.value = track[0].getSettings().zoom;
  slider.oninput = function(event) {
    track[0].applyConstraints({advanced: [ {zoom: event.target.value} ]});
  }
  slider.hidden = false;
}

// for information only
function listDevices() {
  navigator.usb.getDevices()
  .then(devices => {
    console.log("Total devices: " + devices.length);
    devices.forEach(async device => {

      await device.open()
      let {configuration} = device

      if (!configuration) {
        const num = device.configurations[0].configurationValue
        await device.selectConfiguration(num)
        configuration = device.configuration
      }

      if (!configuration) throw new Error('Cannot configure USB Device')
  
      console.log("Product name: " + device.productName);
      console.log("Serial number: " + device.serialNumber);
      console.log("Device class: " + device.deviceClass);
      console.log("Device subclass: " + device.deviceSubclass);
      console.log("Device protocol: " + device.deviceProtocol);
      console.log("Configurations: " + JSON.stringify(device.configurations))
    });
  });
}

// for information only, if using WebUSB
function requestDevice() {
  try {
    // this is alternative to using Promise directly as done below...
    //let usbDevice = await navigator.usb.requestDevice({ filters: [{vendorId: 0x3242,productId: 0x1000 }]});

    // note this call causes a dialog to be displayed requesting permission to access USB
    navigator.usb.requestDevice({filters: [{vendorId: 0x3242, productId: 0x1000}]})
    .then(async (usbDevice) => {
      console.log("Requested device: " + usbDevice.productName);

      await usbDevice.open()
      let {configuration} = usbDevice
      if (!configuration) {
        const num = usbDevice.configurations[0].configurationValue
        console.log("Num: " + num)
        await usbDevice.selectConfiguration(num)
        configuration = usbDevice.configuration
      }

      console.log("Requested device product name: " + usbDevice.productName);
      console.log("Requested device serial number: " + usbDevice.serialNumber);
      console.log("Requested device class: " + usbDevice.deviceClass);

      await usbDevice.selectConfiguration(1)
      // this will fail as WebUSB blocks video devices...
      await usbDevice.claimInterface(0)

      // from here should able to transfer data like...
      // await usbDevice.controlTransferOut({
      //     requestType: 'vendor',
      //     recipient: 'interface',
      //     request: 0x01,  // vendor-specific request: enable channels
      //     value: 0x0013,  // 0b00010011 (channels 1, 2 and 5)
      //     index: 0x0001   // Interface 1 is the recipient
      // });
    })
    .catch(e => {
      console.log("There is no device. " + e);
    });
  } catch (err) {
    console.log('No device selected')
  }
}
