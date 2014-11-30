Physijs.scripts.worker = 'js/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

var MAX_SPEED = 1.0;
var MIN_SPEED = -1.0;
var TURN_FACTOR = 0.03;
var FREE_FLOW_SPEED = 0.2;

//obmocje kjer se lahko premikamo
var MAX_Y=100;
var MAX_X=150;
var MIN_Y=-100;
var MIN_X=-150;

//ZACETEK
var START_X=-140;
var START_Y=0;

//CILJ
var END_X=140;
var END_Y=90;
//Ali je konec
isEnd=0;
//Koncni cas
endTime=0;
var maxTime=200;
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

var score = 0;

//SCORE
var scoreText = document.createElement('div');
scoreText.style.position = 'absolute';
scoreText.style.width = 100;
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
var bonus = [];
var level1Obstacles = [];

var boundaryTexture=["res/ograjaY.png","res/ograjaX.png"];

var asteroidTexturesPaths = ["res/Craterscape.jpg", "res/stone_texture1.jpg"];
var asteroidTextures = [];
var level1_asteroidCoords = [[-125,0], [-110, 10], [-90, -10], [-125, 30], [15, 14], [26, 26]]	//x, y
var level1_bonusCoords = [[-135,-80], [0,0], [140,-90], [-130,10]]

var obstacleTexturesPaths = ["res/metallic-texture-small.jpg"];
var obstacleTextures = [];
var level1_obstacleCoords = [[10, 0, -2], [14, 0, 0], [18, 0, 2]]	//x, y, z
var obstacleTexIndex = [0, 0, 0]

var laserTexturesPaths = ["res/laser1b.png", "res/laser1.png"];
var level1_laserObstacleCoords = [[-10, 0, -2], [-5, 0, 0], [0, 0, 2]]	//x, y, z
var laserObstacleTexIndex = [0, 0, 0]
var laserTextures = [];

var wallTexturesPaths = ["res/metallic-texture-small.jpg"];
var wallTextures = [];
var level1_wallCoords = [[10, 75, 0], [10, 0, 0], [10, -75, 0], [37.5, 22.5, 0], [65, 60, 0], [42, -55, 0]];	//x, y, z
var level1_wallValues = [[5, 50, 8], [5, 50, 8], [5, 50, 8], [50, 5, 8], [5, 80, 8], [67, 20 ,8]];	//width (x), height(y), depth(z)
// var laserObstacleTexIndex = [0, 0, 0]


var playerObjRotation = 0;
var engineActive = 0;
var engineOn = 0;
var goal;
var collisionDetected=0;

var TOTAL_RESOURCES = 3;
var resourceCounter = 0;

var shipZPos = 0;
var TOP_Z_POS = 2;
var LOW_Z_POS = -2;
var dimensionShiftLocked = false;

var lasers = [];

function initialize() {
	//setting up scene
	//scena,...
	scene = new Physijs.Scene;
	scene.setGravity(new THREE.Vector3( 0, 0, 0 ));
	scene.addEventListener('update',function(){
		scene.simulate();
	});
	//scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 1000 );

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight);
	//renderer.setSize( 960, 540);
	document.body.appendChild( renderer.domElement );

	//objekt
	var geometry = new THREE.BoxGeometry( 1, 1, 1 );
	var material = new THREE.MeshBasicMaterial( { color: 0x0021f0 } );


	// ///BOX
	// var box=new Physijs.BoxMesh(
	// 	new THREE.BoxGeometry(5,5,5),
	// 	new THREE.MeshBasicMaterial({color: 0x888888})
	// );
	// box.position.set(-10,-10,0);
	// scene.add(box);

	///LIGHT
	var light = new THREE.AmbientLight( 0xffff00 ); // soft white light
	scene.add( light )

	///END BOX
	//var cube = new THREE.Mesh( geometry, material );
	//scene.add( cube );
	//celoten objekt

	///GROUND
	// var ground_material = Physijs.createMaterial(
	// 	new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture( 'res/stardust-1920x1080.png' ) }),
	// 	.8, // high friction
	// 	.3 // low restitution
	// );
	// ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
	// ground_material.map.repeat.set( 3, 3 );
	//
	// ground = new Physijs.BoxMesh(
	// 	new THREE.BoxGeometry(100, 100, 1),
	// 	ground_material,
	// 	0 // mass
	// );
	// ground.position.set(0,0,0);
	// scene.add(ground);

	///END
	playerObject = new Physijs.BoxMesh( geometry, material, 100 );
	scene.add( playerObject );

	var backgroundFilePath = "res/stardust-3840x2160.png";
	setBackground(backgroundFilePath);

	playerObject.add(camera);		// za TEST - potrebna izboljsava
	camera.position.z = 50;
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
	//scene.simulate();

	playerObject.addEventListener( 'collision', playerCollided);
}

function setBackground(path) {
	//space texture (background)   - BACKGROUND
	THREE.ImageUtils.crossOrigin = '';
	backgroundTexture = THREE.ImageUtils.loadTexture(path);
	// assuming you want the texture to repeat in both directions:
	//backgroundTexture.wrapS = THREE.MirroredRepeatWrapping;
	//backgroundTexture.wrapT = THREE.MirroredRepeatWrapping;
	// how many times to repeat in each direction; the default is (1,1)
	//backgroundTexture.repeat.set( 1, 1 );

	backgroundMaterial = new THREE.MeshBasicMaterial({ map : backgroundTexture });
	backgroundPlane = new THREE.Mesh(new THREE.PlaneGeometry(MAX_X*2, MAX_Y*2), backgroundMaterial);
	//backgroundPlane.material.side = THREE.DoubleSide;
	//backgroundPlane.position.x = 10;
	//backgroundPlane.position.y += 10;
	backgroundPlane.position.z -= 3;

	//backgroundPlane.rotation.z = Math.PI / 2;
	scene.add(backgroundPlane);
	// END OF SETTING BACKGROUND

}

function loadTextures() {
	//load asteroid textures
	for (var i = 0; i < asteroidTexturesPaths.length; i++) {
		var texture = THREE.ImageUtils.loadTexture(asteroidTexturesPaths[i]);
		asteroidTextures.push(texture);
	}

	//load obstacle textures
	for (var i = 0; i < obstacleTexturesPaths.length; i++) {
		var texture = THREE.ImageUtils.loadTexture(obstacleTexturesPaths[i]);
		obstacleTextures.push(texture);
	}

	//load laser textures
	for (var i = 0; i < laserTexturesPaths.length; i++) {
		var texture = THREE.ImageUtils.loadTexture(laserTexturesPaths[i]);
		laserTextures.push(texture);
	}

	//load wall textures
	for (var i = 0; i < wallTexturesPaths.length; i++) {
		var texture = THREE.ImageUtils.loadTexture(wallTexturesPaths[i]);
		wallTextures.push(texture);
	}

}

//map for input values
var activeKeys = {};
activeKeys["forward"] = 0;
activeKeys["backward"] = 0;
activeKeys["rotateLeft"] = 0;
activeKeys["rotateRight"] = 0;
activeKeys["pause"]=-1;
activeKeys["dimensionUp"] = 0;
activeKeys["dimensionDown"] = 0;

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
	if (event.keyCode == 16) {
		//L Shift
		activeKeys["dimensionUp"] = 1;
	}
	if (event.keyCode == 17) {
		//L CTRL
		activeKeys["dimensionDown"] = 1;
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
	if (event.keyCode == 16) {
		//L Shift
		activeKeys["dimensionUp"] = 0;
	}
	if (event.keyCode == 17) {
		//L CTRL
		activeKeys["dimensionDown"] = 0;
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
			engineOn = 1;
		} else if (activeKeys["backward"] == 1) {
			// Down cursor key
			speed = -0.4;
			engineActive = 1;
		} else {
			if (engineOn == 1) {
				if(speed < 0) {		//check if the ship is moving forward
					speed = - FREE_FLOW_SPEED;
				} else speed = FREE_FLOW_SPEED;
			} else speed = 0.0;
			engineActive = 0;
		}
	}

	if (activeKeys["dimensionUp"] == 0 && activeKeys["dimensionDown"] == 0) {
		dimensionShiftLocked = false;
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
	obstacles=obstacles.concat(boundaries);
	for(i=0;i < playerObject.rays.length; i++){
		playerObject.caster.set(playerObject.position, playerObject.rays[i]);
		collisions=playerObject.caster.intersectObjects(obstacles);
		if (collisions.length > 0 && collisions[0].distance <= distance) {
			collisionDetected=1;
		}
	}
}


function playerCollided( other_object, relative_velocity, relative_rotation, contact_normal ) {
	// `this` has collided with `other_object` with an impact speed of `relative_velocity` and a rotational force of `relative_rotation` and at normal `contact_normal`
	//playerObject.setPosition(0,0,0);
		if(other_object.material.wireframe==true){
			scene.remove(other_object);
			score +=500;
		}
		else{
			playerObject.translateY(-10);
			playerObject.__dirtyPosition = true;
			engineOn = 0;
			console.log("trk");
			score -= 100;
			playerObject.setAngularFactor(new THREE.Vector3(0,0,0));
			playerObject.setLinearVelocity({ x: 0, y: 0, z: 0 });
			playerObject.setAngularVelocity({ x: 0, y: 0, z: 0 });
			console.log(contact_normal);
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

	if (engineActive == 1) {
		playerObject.translateY(speed);
		//playerObject.setLinearVelocity({ x: speed * 10, y: 0, z: 0 });
		playerObjRotation = playerObject.rotation.clone();
		playerObject.__dirtyPosition = true;
	} else if (engineActive == 0) {
		var curRotation = playerObject.rotation.clone();	//bi bilo bolje kar v world matrix???
		playerObject.rotation.copy(playerObjRotation);
		playerObject.translateY(speed);
		//playerObject.setLinearVelocity({ x: speed, y: speed, z: 0 });
		playerObject.rotation.copy(curRotation);
		//console.log("opa");
		playerObject.__dirtyPosition = true;
	}

	// if(playerObject.position.x>MAX_X || playerObject.position.x<MIN_X ||playerObject.position.y>MAX_Y || playerObject.position.y<MIN_Y  ){
	// 	playerObject.translateY((-1)*speed);
	// }


	if (turn != 0) {
		playerObject.rotation.z += turn;
		playerObject.__dirtyRotation = true;
	}

	if (dimensionShiftLocked == false) {		//check if dimension shift is not locked
		if (activeKeys["dimensionUp"] == 1) {
			if (shipZPos < TOP_Z_POS) {
				dimensionShiftLocked = true;
				shipZPos += 2;
				playerObject.translateZ(2);
				playerObject.__dirtyPosition = true;
				console.log("dim up");
			}
		} else if (activeKeys["dimensionDown"] == 1) {
			if (shipZPos > LOW_Z_POS) {
				dimensionShiftLocked = true;
				shipZPos -= 2;
				playerObject.translateZ(-2);
				playerObject.__dirtyPosition = true;
				console.log("dim down");
			}
		}
	}


	//	checkCollision();
	//	if(collisionDetected==1){
	//		playerObject.position.x=playerObject.position.x-(playerObject.position.x-prevX)*20;
	//		playerObject.position.y=playerObject.position.y-(playerObject.position.y-prevY)*20;
	//		engineOn=0;
	//	}
	//	collisionDetected=0;
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
	engineOn = 0;

}

function end(){
	if(playerObject.position.x>(END_X-1) && playerObject.position.x<(END_X+1) && playerObject.position.y>(END_Y-1) && playerObject.position.y<(END_Y+1)){
		if(isEnd==0){
			var tmp=maxTime-scoreTime;
			score=score+tmp*10;
			endTime=scoreTime;
			pauseText.innerHTML = "<br>ZMAGA!!!!</br> Potreboval si: "+endTime+"s <br>Score: "+score +"</br><br>Za novo igro pritisni R</br>";
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

function createBoundaries() {
	var textureX = THREE.ImageUtils.loadTexture(boundaryTexture[0]);
	var textureY = THREE.ImageUtils.loadTexture(boundaryTexture[1]);
	textureX.wrapS = THREE.MirroredRepeatWrapping;
	textureX.wrapT = THREE.MirroredRepeatWrapping;
	textureX.repeat.set( 1, 1 );
	textureY.wrapS = THREE.MirroredRepeatWrapping;
	textureY.wrapT = THREE.MirroredRepeatWrapping;
	textureY.repeat.set( 1, 1 );
	// how many times to repeat in each direction; the default is (1,1)
	var box1=new Physijs.BoxMesh(
		new THREE.BoxGeometry(0.01,MAX_Y*2,4),
		new THREE.MeshBasicMaterial({map: textureX}),
		0
	);
	var box2=new Physijs.BoxMesh(
		new THREE.BoxGeometry(0.01,MAX_Y*2,4),
		new THREE.MeshBasicMaterial({map: textureX}),
		0
	);
	var box3=new Physijs.BoxMesh(
		new THREE.BoxGeometry(MAX_X*2,0.01,4),
		new THREE.MeshBasicMaterial({map: textureY}),
		0
	);
	var box4=new Physijs.BoxMesh(
		new THREE.BoxGeometry(MAX_X*2,0.01,4),
		new THREE.MeshBasicMaterial({map: textureY}),
		0
	);
	box1.position.set(MIN_X,0,0);
	scene.add(box1);
	box2.position.set(MAX_X,0,0);
	scene.add(box2);
	box3.position.set(0,MIN_Y,0);
	scene.add(box3);
	box4.position.set(0,MAX_Y,0);
	scene.add(box4);
}

function createBonus() {
	var geom = new THREE.SphereGeometry(1, 8, 8);
	//var texture = THREE.ImageUtils.loadTexture(asteroidTextures[p]);
	var mat = new THREE.MeshLambertMaterial({ color: 0xffff00,transparent: true, opacity: 0.6, wireframe: true });

	var bonus = new Physijs.SphereMesh( geom, mat, 0 );
	//var vec = new THREE.vector
	//aster.setAngularFactor(new THREE.Vector3(0,0,0));
	//aster.setLinearFactor(new THREE.Vector3(0,0,0));
	return bonus;
}

function placeBonus() {
	for (var i = 0; i < level1_bonusCoords.length; i++) {
		var currentBonus = createBonus();
		currentBonus.position.set(level1_bonusCoords[i][0], level1_bonusCoords[i][1], 3);
		bonus.push(currentBonus);
		scene.add(currentBonus);
	}

}

function createAsteroid() {
	var p = Math.round(Math.random() * (asteroidTextures.length - 1));

	var geom = new THREE.SphereGeometry(4, 8, 8);
	//var texture = THREE.ImageUtils.loadTexture(asteroidTextures[p]);
	var texture = asteroidTextures[p];
	var mat = new THREE.MeshBasicMaterial({ map : texture });

	var aster = new Physijs.SphereMesh( geom, mat, 10 );
	//var vec = new THREE.vector
	//aster.setAngularFactor(new THREE.Vector3(0,0,0));
	//aster.setLinearFactor(new THREE.Vector3(0,0,0));
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


function createObstacle(texIndex) {
	var geom = new THREE.CylinderGeometry( 0.5, 0.5, 200, 32 );
	var texture = obstacleTextures[obstacleTexIndex[texIndex]];
	var mat = new THREE.MeshBasicMaterial({ map : texture });
	//var mat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
	var obstacle = new Physijs.CylinderMesh( geom, mat, 0 );

	return obstacle;
}

function createLaserObstacle(texIndex) {
	var geom = new THREE.CylinderGeometry( 0.5, 0.7, 220, 32 );
	var texture = laserTextures[laserObstacleTexIndex[texIndex]];
	var mat = new THREE.MeshBasicMaterial({ map : texture });
	//var mat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
	var obstacle = new Physijs.CylinderMesh( geom, mat, 0 );

	return obstacle;
}

function createWall(texIndex, width, height, depth) {
	var geom = new THREE.BoxGeometry(width, height, depth);
	var texture = wallTextures[0];
	var mat = new THREE.MeshBasicMaterial({ map : texture });
	//var mat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
	var obstacle = new Physijs.CylinderMesh( geom, mat, 0 );

	return obstacle;
}

function placeObstacles() {

	//place laser
	/*
	for (var i = 0; i < level1_obstacleCoords.length; i++) {
		var currentObstacle = createLaserObstacle(i);
		//currentObstacle.position.set(10, 10, -1);
		currentObstacle.position.set(level1_obstacleCoords[i][0], level1_obstacleCoords[i][1], level1_obstacleCoords[i][2]);
		currentObstacle.rotation.y += 0.785;
		level1Obstacles.push(currentObstacle);
		scene.add(currentObstacle);
	}
	*/

	//place laser obstacles
	for (var i = 0; i < level1_laserObstacleCoords.length; i++) {
		var currentObstacle = createLaserObstacle(i);
		//currentObstacle.position.set(10, 10, -1);
		currentObstacle.position.set(level1_laserObstacleCoords[i][0], level1_laserObstacleCoords[i][1], level1_laserObstacleCoords[i][2]);
		currentObstacle.rotation.y += 0.785;
		level1Obstacles.push(currentObstacle);

		scene.add(currentObstacle);
	}

	//place walls
	for (var i = 0; i < level1_wallCoords.length; i++) {
		var currentObstacle = createWall(i, level1_wallValues[i][0], level1_wallValues[i][1], level1_wallValues[i][2]);
		currentObstacle.position.set(level1_wallCoords[i][0], level1_wallCoords[i][1], level1_wallCoords[i][2]);
		//currentObstacle.rotation.y += 0.785;
		level1Obstacles.push(currentObstacle);

		scene.add(currentObstacle);
	}

}


function placeGoal() {
	var geom = new THREE.BoxGeometry(4, 4, 4);
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
	//playerObject.setLinearVelocity({x: 0, y: 0, z:0})
	//scene.simulate();
	//testing();
	requestAnimationFrame(render);
	scene.simulate();
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
	loadTextures();

	placeAsteroids();
	placeObstacles();
	placeBonus();

	createBoundaries();
	placeGoal();
	render();
}

//object.onload = startGame();
var manager = new THREE.LoadingManager();
manager.onLoad = startGame();
