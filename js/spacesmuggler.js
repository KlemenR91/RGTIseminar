
var MAX_SPEED = 1.0;
var MIN_SPEED = -1.0;
var TURN_FACTOR = 0.05;

var playerObject;
var scene;
var camera;
var renderer;
var backgroundPlane;
var backgroundTexture;
var backgroundMaterial;


function initialize() {
	//setting up scene
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
	
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight);
	//renderer.setSize( 960, 540);
	document.body.appendChild( renderer.domElement );
	
	var geometry = new THREE.BoxGeometry( 1, 1, 1 );
	var material = new THREE.MeshBasicMaterial( { color: 0x0021f0 } );
	
	//var cube = new THREE.Mesh( geometry, material );
	//scene.add( cube );
	playerObject = new THREE.Mesh( geometry, material );
	scene.add( playerObject );
	
	var backgroundFilePath = "res/free_space_galaxy_texture.jpg";
	setBackground(backgroundFilePath);
	
	playerObject.add(camera);		// za TEST - potrebna izboljsava
	camera.position.z = 15;
}

function setBackground(path) {
	//space texture (background)   - BACKGROUND
	THREE.ImageUtils.crossOrigin = '';
	backgroundTexture = THREE.ImageUtils.loadTexture(path);
	// assuming you want the texture to repeat in both directions:
	backgroundTexture.wrapS = THREE.RepeatWrapping; 
	backgroundTexture.wrapT = THREE.RepeatWrapping;
	// how many times to repeat in each direction; the default is (1,1),
	//   which is probably why your example wasn't working
	//backgroundTexture.repeat.set( 4, 4 ); 
	
	backgroundMaterial = new THREE.MeshBasicMaterial({ map : backgroundTexture });
	backgroundPlane = new THREE.Mesh(new THREE.PlaneGeometry(160, 90), backgroundMaterial);
	//backgroundPlane.material.side = THREE.DoubleSide;
	//backgroundPlane.position.x = 10;
	//backgroundPlane.position.y += 10;
	backgroundPlane.position.z -= 10;

	//backgroundPlane.rotation.z = Math.PI / 2;
	scene.add(backgroundPlane);
	// END OF SETTING BACKGROUND
	
}

initialize();


//map for input values
var activeKeys = {};
activeKeys["forward"] = 0;
activeKeys["backward"] = 0;
activeKeys["rotateLeft"] = 0;
activeKeys["rotateRight"] = 0;

var moveForward = 0.0;
var moveBackward = 0.0;
var turn = 0.0;
var speed = 0.0;

function handleKeyDown(event) {
	if (event.keyCode == 37) {
		// Left cursor key
		activeKeys["rotateLeft"] = 1;
	}
	if (event.keyCode == 39) {
		// Right cursor key
		activeKeys["rotateRight"] = 1;
	}
	if (event.keyCode == 38) {
		// Up cursor key
		activeKeys["forward"] = 1;
	}
	if (event.keyCode == 40) {
		// Down cursor key
		activeKeys["backward"] = 1;
	}
	
}

function handleKeyUp(event) {
	
	if (event.keyCode == 37) {
		// Left cursor key
		activeKeys["rotateLeft"] = 0;
	}
	if (event.keyCode == 39) {
		// Right cursor key
		activeKeys["rotateRight"] = 0;
	}
	if (event.keyCode == 38) {
		// Up cursor key
		activeKeys["forward"] = 0;
	}
	if (event.keyCode == 40) {
		// Down cursor key
		activeKeys["backward"] = 0;
	}
	
}

function handleKeys() {
	
	//rotation
	if (activeKeys["rotateLeft"] == 1) {
		// Left cursor key
		turn = 1 * TURN_FACTOR;
	} else if (activeKeys["rotateRight"] == 1) {
		// Right cursor key
		turn = -1 * TURN_FACTOR;
	} else {
		turn = 0;
	}
	
	//movement
	if (activeKeys["forward"] == 1) {
		// Up cursor key
		speed = 0.4;								//TEST
	} else if (activeKeys["backward"] == 1) {
		// Down cursor key
		speed = -0.4;
	} else {
		speed = 0;
	}
}

function handleInput() {
	handleKeys();
}

function resetMovementVars() {
	
	moveForward = 0.0;
	moveBackward = 0.0;
	//turn = 0.0;
}

function moveAndRotate() {
	if(speed > MAX_SPEED) {
		speed = MAX_SPEED;
	}
	
	if(speed < MIN_SPEED) {
		speed = MIN_SPEED;
	}
	
	//moveForward += speed;
	//playerObject.position.x += moveForward * 0.01;

	//playerObject.rotation.z += rotate;
	//playerObject.position
	playerObject.translateY(speed);
	
	playerObject.rotation.z += turn;
}

document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;

var render = function () {
	requestAnimationFrame( render );
	
	handleInput();
	
	//cube.rotation.x += 0.1;
	//cube.rotation.y += 0.1;
	//cube.position.z += 0.01;
	
	resetMovementVars();
	moveAndRotate();

	//changing the camera position a bit (so its not on top of the object
	camera.position.x = 0;
	camera.position.y = 6;
	
	renderer.render(scene, camera);
};

render();

