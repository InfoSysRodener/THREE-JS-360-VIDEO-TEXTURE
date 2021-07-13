import '../style.css'
import * as THREE from 'three';
import * as dat from 'dat.gui';
import SceneManager from './sceneManager/scene';



/**
 * Scene
 */
const canvas = document.querySelector('#canvas');
const scene = new SceneManager(canvas);
const clock = new THREE.Clock();
scene.scene.background.set('#101010');
const controls = scene.addOrbitControl();
controls.maxDistance = 300;
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
const material = new THREE.MeshBasicMaterial( { map: videoTexture} );
const mesh = new THREE.Mesh( geometry, material );
scene.add(mesh);


let isPlaying = false;
let continueAtTime = 0;
let midpoint = 0;
let isForward = true;
let isBackward = false;
video.currentTime = 0;

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
	if(video.readyState >= 2){
		midpoint = video.duration / 2;		
	 	play();
	}
 }
 
 forwardBtn.onclick = (e) => {
	 e.preventDefault();
	 
	 forwardBtn.setAttribute('disabled',true);
	 rewindBtn.removeAttribute('disabled');
	 forward(); 
 }
 
 rewindBtn.onclick = (e) => {
	 e.preventDefault();

	 rewindBtn.setAttribute('disabled',true);
	 forwardBtn.removeAttribute('disabled');
	 backward();
	 
 }




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
	loading.style.display = 'none';
})

video.addEventListener('waiting', () => {
	/**
	 * Loading 
	 */
	if(video.currentTime == midpoint){
		loading.style.display = 'none'; 
	}
	else{
		loading.style.display = 'inline'; 
	}
})

/**
 * Ended
 */
video.addEventListener('ended', () => {
	isForward = true;
	isBackward = false;
	video.load();
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
		if(isForward){
			forwardBtn.setAttribute('disabled',true);
			rewindBtn.removeAttribute('disabled');
		}else{
			forwardBtn.removeAttribute('disabled',true);
			rewindBtn.setAttribute('disabled',true);
		}
		video.play();
	}
}

function forward() {
	if(video.readyState >= 2){
		isForward ? continuousTo('forward') : changingTo('backward-forward');
		video.currentTime = continueAtTime;
		video.play()
	}
}

function backward(){
	if(video.readyState >= 2){
		isBackward ? continuousTo('backward') : changingTo('forward-backward');
		video.currentTime = continueAtTime;
		video.play();
	}
}

function changingTo(value){
	let midpoint = video.duration / 2;
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