
var MAX_SPEED = 5.0;

//setting up scene
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight);
//renderer.setSize( 960, 540);
document.body.appendChild( renderer.domElement );

var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshBasicMaterial( { color: 0x0021f0 } );

//var cube = new THREE.Mesh( geometry, material );
//scene.add( cube );
var playerObject = new THREE.Mesh( geometry, material );
scene.add( playerObject );

camera.position.z = 5;

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
	
	if (activeKeys["rotateLeft"] == 1) {
		// Left cursor key
		//rotationVelocityCubeY -= 1;
		//alert("yay");
	}
	if (activeKeys["rotateRight"] == 1) {
		// Right cursor key
		//rotationVelocityCubeY += 1;
	}
	if (activeKeys["forward"] == 1) {
		// Up cursor key
		//rotationVelocityCubeX -= 1;
		speed = 1;								//TEST
	}
	if (activeKeys["backward"] == 1) {
		// Down cursor key
		//rotationVelocityCubeX += 1;
	}
}

function handleInput() {
	handleKeys();
}

function resetMovementVars() {
	
	moveForward = 0.0;
	moveBackward = 0.0;
	turn = 0.0;
}

function moveAndRotate() {
	if(speed > MAX_SPEED) {
		speed = MAX_SPEED;
	}
	
	if(speed < 0) {
		speed = 0.0;
	}
	
	//moveForward += speed;
	//playerObject.position.x += moveForward * 0.01;

	//playerObject.rotation.z += rotate;
	//playerObject.position
	playerObject.translateY(0.01);
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

	renderer.render(scene, camera);
};

render();

