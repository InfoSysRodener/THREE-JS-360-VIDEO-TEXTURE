import '../style.css'
import * as THREE from 'three';
import * as dat from 'dat.gui';
import SceneManager from './sceneManager/scene';

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

playBtn.onclick = () => {
	play();
	rewindBtn.removeAttribute('disabled');
	forwardBtn.removeAttribute('disabled');
}

forwardBtn.onclick = () => {
	forward();
	forwardBtn.setAttribute('disabled',true);
	playBtn.removeAttribute('disabled');
	rewindBtn.removeAttribute('disabled');
}

rewindBtn.onclick = () => {
	backward();
	rewindBtn.setAttribute('disabled',true);
	playBtn.removeAttribute('disabled');
	forwardBtn.removeAttribute('disabled');
}

/**
 * Scene
 */
const canvas = document.querySelector('#canvas');
const scene = new SceneManager(canvas);
const clock = new THREE.Clock();
scene.scene.background.set('#101010');
const controls = scene.addOrbitControl();
controls.maxDistance = 500;
controls.minDistance = 1;

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
const geometry = new THREE.SphereGeometry( 500, 60, 60 );
geometry.scale(-1,1,1);
const material = new THREE.MeshBasicMaterial( { map: videoTexture } );
const mesh = new THREE.Mesh( geometry, material );
scene.add(mesh);


let isPlaying = false;
let continueAtTime = 0;
let midpoint = video.duration/2;
let isForward = true;
let isBackward = false;

video.addEventListener('timeupdate', () => {
	if (isForward && video.currentTime > midpoint ) {
		forwardBtn.setAttribute('disabled',true);
		video.currentTime = midpoint;
		video.pause();
	} 
});

video.addEventListener('playing', () => {
	isPlaying = true;
	loading.style.display = 'none';
})

video.addEventListener('waiting', () => {
	/**
	 * Loading 
	 */
	loading.style.display = 'inline'; 
})


function play(){
	if(isPlaying){
		video.pause();
		isPlaying = false;
		pauseIcon.style.display = 'none';
		playIcon.style.display = 'inline';
	}else{
		video.play();
		pauseIcon.style.display = 'inline';
		playIcon.style.display = 'none';
	}
}

function forward() {
	isForward ? continuousTo('forward') : changingTo('backward-forward');
	video.currentTime = continueAtTime;
	video.play();
}

function backward(){
	isBackward ? continuousTo('backward') : changingTo('forward-backward');
	video.currentTime = continueAtTime;
	video.play();
}

function changingTo(value){
	switch(value){
		case 'forward-backward' :
			isForward = false;
			isBackward = true;
			continueAtTime = ((video.currentTime - midpoint) * -1)  + midpoint;
			break;
		case 'backward-forward' :
			isForward = true;
			isBackward = false;
			continueAtTime = ((video.currentTime - midpoint) * -1)  + midpoint;
			break;	
	}
}

function continuousTo(value){
	switch(value){
		case 'forward' :
			isForward = true;
			isBackward = false;
			continueAtTime = video.currentTime;
			break;
		case 'backward':
			isForward = false;
			isBackward = true;
			continueAtTime = video.currentTime;
			break;
	}
}



const animate = () => {
	videoTexture.update();
	
	controls.update();
	
	scene.onUpdate();
	scene.onUpdateStats();
	requestAnimationFrame( animate );
};

animate();