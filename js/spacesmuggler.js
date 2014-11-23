var MAX_SPEED = 1.0;
var MIN_SPEED = -1.0;
var TURN_FACTOR = 0.05;

//obmocje kjer se lahko premikamo
var MAX_Y=40;
var MAX_X=75;
var MIN_Y=-40;
var MIN_X=-75;

var start_position;
var playerObject;
var scene;
var camera;
var renderer;
var backgroundPlane;
var backgroundTexture;
var backgroundMaterial;
var testtesttest="haha";
var testingText;
//SCORE
var scoreText = document.createElement('div');
scoreText.style.position = 'absolute';
scoreText.style.width = 70;
scoreText.style.height = 20;
scoreText.style.backgroundColor = "white";
scoreText.style.top = 10;
scoreText.style.left = 10;
document.body.appendChild(scoreText);
var scoreTime=-1;
var secondTime=new Date().getTime();+1000;

var boundaries = [];
var asteroids = [];

var asteroidTextures = ["res/Craterscape.jpg", "res/stone_texture1.jpg"];
var level1_asteroidCoords = [[10, 20], [10, 25], [20, 20]]	//x, y

var playerObjRotation = 0;
var engineActive = 0;

function initialize() {
	//setting up scene
	//scena,...
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight);
	//renderer.setSize( 960, 540);
	document.body.appendChild( renderer.domElement );

	 //objekt
	var geometry = new THREE.BoxGeometry( 1, 1, 1 );
	var material = new THREE.MeshBasicMaterial( { color: 0x0021f0 } );

	//var cube = new THREE.Mesh( geometry, material );
	//scene.add( cube );
	//celoten objekt
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
	//backgroundTexture.repeat.set( 2, 2 );

	backgroundMaterial = new THREE.MeshBasicMaterial({ map : backgroundTexture });
	backgroundPlane = new THREE.Mesh(new THREE.PlaneGeometry(160, 90), backgroundMaterial);
	//backgroundPlane.material.side = THREE.DoubleSide;
	//backgroundPlane.position.x = 10;
	//backgroundPlane.position.y += 10;
	backgroundPlane.position.z -= 3;

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
	if (event.keyCode == 82) {
		// Down cursor key
		activeKeys["restart"] = 1;
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
		engineActive = 1;
	} else if (activeKeys["backward"] == 1) {
		// Down cursor key
		speed = -0.4;
		engineActive = 1;
	} else {
		speed = 0.1;
		engineActive = 0;
	}
	//restart
	if (activeKeys["restart"] == 1) {
		// Up cursor key
		restart();
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
	
	//move player object
	//playerObject.translateY(speed);
	/*
	var matrix = new THREE.Matrix4();
	matrix.extractRotation( playerObject.matrix );

	var direction = new THREE.Vector3(1, 0, 0);
	direction = matrix.multiplyVector3(direction);
	
	playerObject.translateOnAxis(direction, speed);
	*/
	
	if (engineActive == 1) {
		playerObject.translateY(speed);
		playerObjRotation = playerObject.rotation.clone();
	} else {
		var curRotation = playerObject.rotation.clone();	//bi bilo bolje kar v world matrix???
		playerObject.rotation.copy(playerObjRotation);
		playerObject.translateY(speed);
		playerObject.rotation.copy(curRotation);
	}
	
	if(playerObject.position.x>MAX_X || playerObject.position.x<MIN_X ||playerObject.position.y>MAX_Y || playerObject.position.y<MIN_Y  ){
		playerObject.translateY((-1)*speed);
	}
	
	
	if (turn != 0) {
		playerObject.rotation.z += turn;
	}
	
}

function drawHUD(){
	var lastTime= new Date().getTime();
	if (secondTime < lastTime) {
		scoreTime=scoreTime+1;
		secondTime=secondTime+1000;
	}
	var a=playerObject.position.x;
	scoreText.innerHTML = " Time: "+ scoreTime;
}
function testing(besedilo){
	//testiranje
	var testText = document.createElement('div');
	testText.style.position = 'absolute';
	testText.style.width = 200;
	testText.style.height = 200;
	testText.style.backgroundColor = "white";
	testText.style.top = 10;
	testText.style.left = 10;
	document.body.appendChild(testText);
	testText.innerHTML = besedilo;

}
function restart(){
	scoreTime=0;
	playerObject.position.set(0,0,0);
	playerObject.rotation.set(0,0,0,"XYZ");
	activeKeys["restart"] = 0;
}

function pause() {

}

function createBoundary() {

}

function placeBoundaries() {

}

function mapBoundaries(){

}

function createAsteroid() {
	var p = Math.round(Math.random() * (asteroidTextures.length - 1));
	
	var geom = new THREE.SphereGeometry(4, 8, 8);
	var texture = THREE.ImageUtils.loadTexture(asteroidTextures[p]);
	var mat = new THREE.MeshBasicMaterial({ map : texture });
	
	var aster = new THREE.Mesh( geom, mat );
	return aster;
}

function placeAsteroids() {
	for (var i = 0; i < level1_asteroidCoords.length; i++) {
		var currentAster = createAsteroid();
		currentAster.position.set(level1_asteroidCoords[i][0], level1_asteroidCoords[i][1], 0);
		asteroids.push(currentAster);
		scene.add(currentAster);
	}

}

document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;

var render = function () {
	//testing(playerObject.position.x);
	requestAnimationFrame( render );
	drawHUD();
	handleInput();

	//cube.rotation.x += 0.1;
	//cube.rotation.y += 0.1;
	//cube.position.z += 0.01;

	resetMovementVars();
	moveAndRotate();

	//changing the camera position a bit, so its not on top of the object
	camera.position.x = 0;
	camera.position.y = 6;
	//camera.rotation.x = 0.2;

	renderer.render(scene, camera);
};

placeAsteroids();
render();
