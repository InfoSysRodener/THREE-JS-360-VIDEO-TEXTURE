import '../style.css'
import * as THREE from 'three';
import * as dat from 'dat.gui';
import SceneManager from './sceneManager/scene';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
const gui = new dat.GUI();

/**
 * Scene
 */
const canvas = document.querySelector('#canvas');
const scene = new SceneManager(canvas);
const clock = new THREE.Clock();
scene.scene.background.set('#101010');
const controls = scene.addOrbitControl();
controls.target.set(1,1,1);
controls.maxDistance = 3000;
controls.minDistance = -3000;
controls.panSpeed = 3;
controls.rotateSpeed = 3;
controls.zoomSpeed = 3;

controls.mouseButtons = {
	LEFT: THREE.MOUSE.ROTATE,
	MIDDLE: THREE.MOUSE.DOLLY,
	RIGHT: THREE.MOUSE.PAN
}


controls.touches = {
	ONE: THREE.TOUCH.ROTATE,
	TWO: THREE.TOUCH.DOLLY_PAN
}


let minPan = new THREE.Vector3( - 2500, - 2500, - 2500 );
let maxPan = new THREE.Vector3( 2500, 2500, 2500 );
let _v = new THREE.Vector3();
    
controls.addEventListener("change", function() {
    _v.copy(controls.target);
    controls.target.clamp(minPan, maxPan);
    _v.sub(controls.target);
    scene.camera.position.sub(_v);
});

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1);
scene.add(ambientLight);

/**
 * Video Texture
 */
const video = document.getElementById('video');
const videoTexture = new THREE.VideoTexture(video);
videoTexture.format = THREE.RGBFormat;
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;

/**
 * Mesh
 */
const geometry = new THREE.SphereGeometry( 6000, 60, 60 );
geometry.scale(-1,1,1);
const material = new THREE.MeshBasicMaterial( { map: videoTexture } );
const mesh = new THREE.Mesh( geometry, material );
scene.add(mesh);


/**
 * GUI Camera
 */
 const debugCamera = {
	 speed:3
 };

 gui.add(debugCamera,'speed').min(1).max(5).step(1).onFinishChange(() => {
	 controls.panSpeed = debugCamera.speed;
	 controls.rotateSpeed = debugCamera.speed;
	 controls.zoomSpeed = debugCamera.speed;
 }).name('Camera Speed');

 gui.add(video, 'playbackRate').min(0.5).max(3).step(0.001).name('Video Speed');

/**
 * Video 
 */
let isPlaying = false;
let continueAtTime = 0;
let midpoint = 0;
let isForward = true;
let isBackward = false;
// video.currentTime = 0;
// video.play();
if(video.readyState >= 3){
	midpoint = video.duration / 2;
}
/**
 * Dom
 */
 const playBtn = document.querySelector('.playBtn');
 const forwardBtn = document.querySelector('.forwardBtn');
 const rewindBtn = document.querySelector('.rewindBtn');
 const playIcon = document.querySelector('.playIcon');
 const pauseIcon = document.querySelector('.pauseIcon');
 const loading = document.querySelector('.loading');
 pauseIcon.style.display = 'none';
 rewindBtn.setAttribute('disabled',true);
 
 playBtn.onclick = (e) => {
	e.preventDefault();	
	play();
 }
 
 forwardBtn.onclick = (e) => {
	 e.preventDefault();
	 forward(); 
	 changingIcon();
 }
 
 rewindBtn.onclick = (e) => {
	 e.preventDefault();
	 backward();
	 changingIcon();
 }

 function changingIcon(){
	 if(isForward){
		forwardBtn.setAttribute('disabled',true);
		rewindBtn.removeAttribute('disabled');
	 }else{
		rewindBtn.setAttribute('disabled',true);
		forwardBtn.removeAttribute('disabled');
	 }
 }

 /**
  * Keyboard
  */
 window.addEventListener('keyup', (event) => {
	
	if(event.key === 'ArrowUp' && event.code === 'ArrowUp'){
		forward();
		changingIcon();
	}

	if(event.key === 'ArrowDown' && event.code === 'ArrowDown'){
		backward();
		changingIcon();
	}
  });


video.addEventListener('timeupdate', () => {
	if (isForward && video.currentTime > midpoint ) {
		forwardBtn.setAttribute('disabled',true);
		video.currentTime = midpoint;
		video.pause();
	}
});

video.addEventListener('playing', () => {
	isPlaying = true;
	pauseIcon.style.display = 'inline';
	playIcon.style.display = 'none';
	// loading.style.display = 'none';
});

// video.addEventListener('seeking', (event) => {
// 	console.log('Video is seeking a new position.');
// });

// video.addEventListener('seeked', (event) => {
// 	console.log('Video found the playback position it was looking for.');
// });

// video.addEventListener("suspend", function(e) {
//     console.log("[Suspended] loading of video");
//     if ( video.readyState == 4 ) {
//         console.log("[Finished] loading of video");
//     }
// });

// video.addEventListener('loadedmetadata', function() {
//     if (video.buffered.length === 0) return;

//     const bufferedSeconds = video.buffered.end(0) - video.buffered.start(0);
//     console.log(`${bufferedSeconds} seconds of video are ready to play.`);
// });

// video.addEventListener('waiting', () => {
// 	/**
// 	 * Loading 
// 	 */
// 	if(video.currentTime == midpoint){
// 		loading.style.display = 'none'; 
// 	}
// 	else{
// 		loading.style.display = 'inline'; 
// 	}
// })

/**
 * Ended
 */
video.addEventListener('ended', () => {
	isForward = true;
	// video.load();
})

video.addEventListener('pause', () => {
	isPlaying = false;
	pauseIcon.style.display = 'none';
	playIcon.style.display = 'inline';
})

function play(){
	if(isPlaying) {
		video.pause();
	}else{
		changingIcon();
		video.play();
	}
}

function forward() {
	isForward = true;
	switching();
}

function backward(){
	isForward = false;
	switching();
}

function switching(){
	video.currentTime = ((video.currentTime - midpoint) * -1)  + midpoint;;
	video.play();
}

// function changingTo(value){
// 	switch(value){
// 		case 'forward-backward' :
// 			isForward = false;
// 			isBackward = true;
// 			continueAtTime = ((video.currentTime - midpoint) * -1)  + midpoint;
// 			break;
// 		case 'backward-forward' :
// 			isForward = true;
// 			isBackward = false;
// 			continueAtTime = ((video.currentTime - midpoint) * -1)  + midpoint;
// 			break;	
// 	}
// }

// function continuousTo(value){
// 	switch(value){
// 		case 'forward' :
// 			isForward = true;
// 			isBackward = false;
// 			continueAtTime = video.currentTime;
// 			break;
// 		case 'backward':
// 			isForward = false;
// 			isBackward = true;
// 			continueAtTime = video.currentTime;
// 			break;
// 	}
// }


const animate = () => {
	/**
	 * Update Texture
	 */
	videoTexture.update();
	
	controls.update();

	scene.onUpdate();
	scene.onUpdateStats();
	requestAnimationFrame( animate );
};

animate();