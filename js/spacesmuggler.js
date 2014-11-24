var MAX_SPEED = 1.0;
var MIN_SPEED = -1.0;
var TURN_FACTOR = 0.03;

//obmocje kjer se lahko premikamo
var MAX_Y=40;
var MAX_X=75;
var MIN_Y=-40;
var MIN_X=-75;

//ZACETEK
var START_X=-60;
var START_Y=0;

//CILJ
var END_X=0;
var END_Y=0;
//Ali je konec
isEnd=0;
//Koncni cas
endTime=0;

//Podatki
var start_position;
var playerObject;
var scene;
var camera;
var renderer;
var backgroundPlane;
var backgroundTexture;
var backgroundMaterial;
//PAUSE
//pauseCheck pove ali je vkljucena pavza ali ne. Ce je manj kot 0 NI vkljucena
var pauseCheck=-1;
//pauseTime pove koliko casa smo igrali do pritiska pavze
var pauseTime=0;
//pauseText je besedilo pavze
var pauseText = document.createElement('div');
pauseText.style.position = 'absolute';
pauseText.style.width = 200;
pauseText.style.height = 200;
pauseText.style.top = window.innerHeight/2;
pauseText.style.left = window.innerWidth/2-100;
document.body.appendChild(pauseText);
pauseText.style.display= 'none';
pauseText.style.backgroundColor = "transparent";


//SCORE
var scoreText = document.createElement('div');
scoreText.style.position = 'absolute';
scoreText.style.width = 70;
scoreText.style.height = 20;
scoreText.style.backgroundColor = "white";
scoreText.style.top = 10;
scoreText.style.left = 10;
scoreText.style.color = "white";
scoreText.style.fontSize="large";
scoreText.style.backgroundColor = "transparent";
document.body.appendChild(scoreText);
var scoreTime=-1;
var secondTime=new Date().getTime();+1000;

var boundaries = [];
var asteroids = [];

var asteroidTextures = ["res/Craterscape.jpg", "res/stone_texture1.jpg"];
var level1_asteroidCoords = [[10, 20], [10, 25], [20, 20]]	//x, y

var playerObjRotation = 0;
var engineActive = 0;
var engineOn = 0;
var goal;
var collisionDetected=0;

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

	var backgroundFilePath = "res/stardust-1920x1080.png";
	setBackground(backgroundFilePath);

	playerObject.add(camera);		// za TEST - potrebna izboljsava
	camera.position.z = 15;
	playerObject.position.set(START_X,START_Y,0);
	playerObject.rotation.set(0,0,0);
	playerObject.rays=[
		new THREE.Vector3(0, 0, 1),
		new THREE.Vector3(1, 0, 1),
		new THREE.Vector3(1, 0, 0),
		new THREE.Vector3(1, 0, -1),
		new THREE.Vector3(0, 0, -1),
		new THREE.Vector3(-1, 0, -1),
		new THREE.Vector3(-1, 0, 0),
		new THREE.Vector3(-1, 0, 1)
	];
	playerObject.caster=new THREE.Raycaster();
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


//map for input values
var activeKeys = {};
activeKeys["forward"] = 0;
activeKeys["backward"] = 0;
activeKeys["rotateLeft"] = 0;
activeKeys["rotateRight"] = 0;
activeKeys["pause"]=-1;
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
	if (event.keyCode == 82) {
		// Down cursor key
		activeKeys["restart"] = 1;
	}
	//Pause escape == 27
	if (event.keyCode == 80) {
		pause();
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
		activeKeys["restart"] = 0;
	}
}

function handleKeys() {
	if(pauseCheck<0){
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
	}

	//restart
	if (activeKeys["restart"] == 1) {
		// pressed R
		restart();
	}
}

function handleInput() {
	handleKeys();
}

function checkCollision(){
	var collisions;
	var i;
	var distance = 1;
	var obstacles = asteroids;
	for(i=0;i < playerObject.rays.length; i++){
		playerObject.caster.set(playerObject.position, playerObject.rays[i]);
		collisions=playerObject.caster.intersectObjects(obstacles);
		if (collisions.length > 0 && collisions[0].distance <= distance) {
			collisionDetected=1;
		}
	}
}

function resetMovementVars() {

	moveForward = 0.0;
	moveBackward = 0.0;
	//turn = 0.0;
}

function moveAndRotate() {
	prevX=playerObject.position.x;
	prevY=playerObject.position.y;

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
	checkCollision();
	if(collisionDetected==1){
		playerObject.position.x=playerObject.position.x-(playerObject.position.x-prevX)*3;
		playerObject.position.y=playerObject.position.y-(playerObject.position.y-prevY)*3;
	}
	collisionDetected=0;
}
function startPosition(){
	playerObject.position.set(START_X,START_Y,0);
	playerObject.rotation.set(0,0,0);
	isEnd=0;
	scoreTime=0;
	pauseTime=0;
	endTime=0;
	pauseText.style.display= 'none';
	pauseCheck=-1;
}
function pause(){
	if(pauseCheck<0){
		pauseTime=scoreTime;
		pauseText.innerHTML = "<br>PAUSE! </br>";
		pauseText.style.display= 'inline';
		speed=0;
		pauseText.style.position = 'absolute';
		pauseText.style.width = 200;
		pauseText.style.height = 200;
		pauseText.style.color = "white";
		pauseText.style.backgroundColor = "transparent";
		pauseText.style.top = window.innerHeight/2;
		pauseText.style.left = window.innerWidth/2-100;
		pauseText.style.textAlign="center";
		pauseText.style.fontSize="30px";

	}
	else{
		scoreTime=pauseTime;
		pauseText.style.display= 'none';
	}
	pauseCheck=pauseCheck*(-1);
}
function drawHUD(){
	var lastTime= new Date().getTime();
	if (secondTime < lastTime) {
			scoreTime=scoreTime+1;
			secondTime=secondTime+1000;
	}
	var a=playerObject.position.x;
	if(pauseCheck<0){
		scoreText.innerHTML = " Time: "+ scoreTime;
	}
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
	testText.innerHTML = besedilo+" " + playerObject.position.y;

}
function restart(){
	playerObject.position.set(START_X,START_Y,0);
	playerObject.rotation.set(0,0,0);
	if(pauseCheck>0){
		pause();
		pauseCheck=-1;
	}
	scoreTime=0;
	pauseTime=0;
	isEnd=0;

}

function end(){
	if(playerObject.position.x>(END_X-1) && playerObject.position.x<(END_X+1) && playerObject.position.y>(END_Y-1) && playerObject.position.y<(END_Y+1)){
			if(isEnd==0){
				endTime=scoreTime;
				pauseText.innerHTML = "<br>ZMAGA!!!!</br> Potreboval si: "+endTime+"s <br></br><br>Za novo igro pritisni R</br>";
				pauseText.style.display= 'inline';
				pauseText.style.color="white";
				pauseText.style.width = 400;
				pauseText.style.height = 400;
				pauseText.style.textAlign="center";
				pauseText.style.fontSize="20px";
				pauseText.style.backgroundColor = "transparent";
				pauseText.style.top = window.innerHeight/2-200;
				pauseText.style.left = window.innerWidth/2-200;
				pauseTime=scoreTime;
				pauseCheck=1;
				speed=0;
				isEnd=1;
			}
	}
}
function createBoundary() {

}

function placeBoundaries() {

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

function placeGoal() {
	var geom = new THREE.BoxGeometry(2, 2, 2);
	var texture = THREE.ImageUtils.loadTexture("res/goalTexture.png");

	goalMat = new THREE.MeshBasicMaterial({ map : texture });
	goal = new THREE.Mesh( geom, goalMat );
	scene.add(goal);

	goal.position.set(END_X, END_Y, 0);
}


document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;

var render = function () {
	//testing(playerObject.position.x);

	requestAnimationFrame(render);
	drawHUD();
	end();
	handleInput();
	checkCollision();

	//cube.rotation.x += 0.1;
	//cube.rotation.y += 0.1;
	//cube.position.z += 0.01;
	resetMovementVars();
	moveAndRotate();

	// prevPositionX=playerObject.position.x;
	// prevPositionY=playerObject.position.y;
	// if(collisionDetected==0){
	// 	resetMovementVars();
	// 	moveAndRotate();
	// }
	// else{
	// 	playerObject.position.x=prevPositionX;
	// 	playerObject.position.y=prevPositionY;
	// 	collisionDetected=0;
	//
	// }


	//changing the camera position a bit, so its not on top of the object
	camera.position.x = 0;
	camera.position.y = 6;
	//camera.rotation.x = 0.2;

	renderer.render(scene, camera);
};

function startGame() {
	initialize();

	placeAsteroids();
	placeGoal();
	render();
}

//object.onload = startGame();
var manager = new THREE.LoadingManager();
manager.onLoad = startGame();
