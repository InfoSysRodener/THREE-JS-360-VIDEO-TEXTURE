import '../style.css'
import * as THREE from 'three';
import * as dat from 'dat.gui';
import SceneManager from './sceneManager/scene';
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
let midpoint = 0;
let isForward = true;

/**
 * Dom
 */
 const playBtn = document.querySelector('.playBtn');
 const forwardBtn = document.querySelector('.forwardBtn');
 const rewindBtn = document.querySelector('.rewindBtn');
 const playIcon = document.querySelector('.playIcon');
 const pauseIcon = document.querySelector('.pauseIcon');
 pauseIcon.style.display = 'none';
 

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
		isForward = true;
		video.currentTime = midpoint;
		video.pause();
	}
});

video.addEventListener('playing', () => {
	pauseIcon.style.display = 'inline';
	playIcon.style.display = 'none';
});

/**
 * Ended
 */
video.addEventListener('ended', () => {
	isForward = false;
	video.pause();
})

video.addEventListener('pause', () => {
	pauseIcon.style.display = 'none';
	playIcon.style.display = 'inline';
})

function play(){
	if(video.paused){
		playVideo();
		changingIcon();
	}else{
		video.pause();
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
	video.currentTime = ((video.currentTime - midpoint) * -1)  + midpoint;
}


async function playVideo(){
	if(video.readyState >= 2){
		try{
			midpoint = video.duration / 2;
			await video.play();
		}catch(err){
			console.log('error',err);
		}
	}
}



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