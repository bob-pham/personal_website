import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js';


// Constants
const SPIN_RATE = 0.003;
const SPIN_FIX_RATE = 0.05;
// States organized [pos_from_top, x, y, z, rotation_y]

let aboutMePosition = document.getElementById('about_me').getBoundingClientRect().top;
let projectsPosition = document.getElementById('projects').getBoundingClientRect().top - document.getElementById('projects').clientHeight - document.getElementById('projects_bulk').clientHeight;
let transitionPosition = projectsPosition - aboutMePosition;
let initialState = [0, 0.75, 1.6, 2.5, 0];
let aboutMeState = [aboutMePosition, 1.4, 1.7, 0, Math.PI / 2];
let transState = [transitionPosition, 0.5, 1.6, -2, Math.PI];
let pcState = [projectsPosition, 0.68, 1.3, -0.15, (3 * Math.PI) / 2];
// const pcState = [projectsPosition, 0.68, 1.3, -0.12, (3 * Math.PI) / 2];


let spinning = true;
let hasNotStopAboutMe = true;
let hasNotStopTechnicalProjects = true;

//Scene objects----------------

//three js scene
const scene = new THREE.Scene();
//camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

//lights
const pointLight = new THREE.PointLight(0xffffff);
const ambientLight = new THREE.AmbientLight(0xffffff);

//scene renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
  alpha: true
});

// ---------------------------


//initialize scene------------

//set initial camera position
camera.position.set(initialState[1], initialState[2], initialState[3]);

//add lights
pointLight.position.set(5, 5, 5);
scene.add(pointLight, ambientLight);


//----------------------------


//loads blender model
const loader = new GLTFLoader();
  loader.load( './blender_assets/SCENE.gltf', function ( gltf ) {
    scene.add( gltf.scene );
    
    gltf.scene.rotateY(Math.PI / 2);

    render();
  } );

renderer.render(scene, camera);



//createss stars with a random position
function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x, y, z);
  scene.add(star);
}

//create 100 stars
Array(100).fill().forEach(addStar);

//sets the device pixel ratio
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

//keeps the window size aspect ratio 
window.onresize = function() {
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  //makes sure positions are still properly relative to each other
  aboutMePosition = document.getElementById('about_me').getBoundingClientRect().top;
  projectsPosition = document.getElementById('projects').getBoundingClientRect().top - document.getElementById('projects').clientHeight - document.getElementById('projects_bulk').clientHeight;
  transitionPosition = projectsPosition - aboutMePosition;
  initialState = [0, 0.75, 1.6, 2.5, 0];
  aboutMeState = [aboutMePosition, 1.4, 1.7, 0, Math.PI / 2];
  transState = [transitionPosition, 0.5, 1.6, -2, Math.PI];
  pcState = [projectsPosition, 0.68, 1.3, -0.12, (3 * Math.PI) / 2];

  moveCamera();

};


// renderer.render(scene, camera);

function animate() {
  requestAnimationFrame(animate);

  if (spinning) {
    scene.rotation.y += SPIN_RATE;
    scene.rotation.y = scene.rotation.y % (2 * Math.PI);
  } else if (scene.rotation.y != 0 || scene.rotation.y % (2 * Math.PI) != 0) {
    scene.rotation.y = scene.rotation.y + SPIN_FIX_RATE >= (2 * Math.PI) ? 0 : scene.rotation.y + SPIN_FIX_RATE; 
  }

  renderer.render(scene, camera);
}


function moveCamera() {
  const t = document.body.getBoundingClientRect().top;

  spinning = !(document.documentElement.scrollTop || document.body.scrollTop);

  // Spins the camera to that it is looking at me head on
  if (-t < aboutMeState[0] && -t >= 0) {
    camera.position.x = getNextPos(t, 1, initialState, aboutMeState);
    camera.position.y = getNextPos(t, 2, initialState, aboutMeState);
    camera.position.z = getNextPos(t, 3, initialState, aboutMeState);
    camera.rotation.y = getNextPos(t, 4, initialState, aboutMeState);
    
    //Spins the camera into the transition state
  } else if (-t >= aboutMeState[0] && -t <= transState[0]) {
    camera.position.x = getNextPos(t, 1, aboutMeState, transState);
    camera.position.y = getNextPos(t, 2, aboutMeState, transState);
    camera.position.z = getNextPos(t, 3, aboutMeState, transState);
    camera.rotation.y = getNextPos(t, 4, aboutMeState, transState);

    //Spins the camera so that it looks into the monitor
  } else if (-t > transState[0] && -t < pcState[0]) {
    camera.position.x = getNextPos(t, 1, transState, pcState);
    camera.position.y = getNextPos(t, 2, transState, pcState);
    camera.position.z = getNextPos(t, 3, transState, pcState);
    camera.rotation.y = getNextPos(t, 4, transState, pcState);
  } else if (-t >= pcState[0]) {
    camera.position.x = pcState[1];
    camera.position.y = pcState[2];
    camera.position.z = pcState[3];
    camera.rotation.y = pcState[4];
  }


  // if (hasNotStopAboutMe && -t >= aboutMeState[0]) {
  //   stopScroll(-aboutMeState[0]);

  //   camera.position.x = initialState[1] + ((t / aboutMeState[0]) * initialState[1]) + (t * -aboutMeState[1] / aboutMeState[0]);
  //   camera.position.y = initialState[2] + ((t / aboutMeState[0]) * initialState[2]) + (t * -aboutMeState[2] / aboutMeState[0]);
  //   camera.position.z = initialState[3] + ((t / aboutMeState[0]) * initialState[3]); 

  //   camera.rotation.y = (aboutMeState[4]) * (-t / aboutMeState[0]);
  //   hasNotStopAboutMe = false;

  //   setTimeout(function() {
  //     hasNotStopAboutMe = true;
  //   }, 30000);

  //   setTimeout(letScroll, 3000);
  // }


}

//lets the user scroll, sets scrolling to move the camera 
function letScroll() {
  document.body.onscroll = moveCamera;
}


//stops the user from scrolling 
function stopScroll(pos) {
  document.body.onscroll = function() {
    window.scrollTo(0, -pos);
  };
}


//returns the next camera position
function getNextPos(t, index, arrStart, arrEnd) {
  return ((-t * (arrEnd[index] - arrStart[index])) / arrEnd[0]) + arrStart[index];
}

document.getElementById("about-me-button").addEventListener("click", scrollToAboutMe, false);
document.getElementById("projects-button").addEventListener("click", scrollToProjects, false);

function scrollToAboutMe() {
  window.scroll({
    top: aboutMePosition,
    behavior: 'smooth'
  });
}

function scrollToProjects() {
  window.scroll({
    top: document.getElementById('projects').getBoundingClientRect().top,
    behavior: 'smooth'
  });
}


function render() {
  renderer.render(scene, camera);
}


//initialize page



document.body.onscroll = moveCamera;
moveCamera();
animate();