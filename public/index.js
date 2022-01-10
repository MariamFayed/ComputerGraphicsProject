import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js';
import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/controls/OrbitControls.js';
import { TrackballControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/controls/TrackballControls.js';
import { GLTFLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/loaders/GLTFLoader.js';
import { Water } from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/objects/Water2.js';
import { GUI } from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/libs/dat.gui.module.js';
import  { firefunc }  from './FireShader.js';


function main() {
  const params = {
    color: '#ffffff',
    scale: 4,
    flowX: 1,
    flowY: 1
  };


  let water;
  var x = -30;


  //To control the ship movement speed
  var controls1 = new function () {
    this.rotationSpeed = 0.04;

  };



  //The canvas that we will render on
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ canvas });

  // listen to the resize event
  window.addEventListener('resize', onResize, false);


  var camera;


  // create a scene, that will hold all our elements
  const scene = new THREE.Scene();

  // Keyboard Controllers
  document.addEventListener('keydown', function (event) {
    if (event.key == "Left") {
      console.log('Left was pressed');
    }
    else if (event.key == "Right") {
      alert('Right was pressed');
    }
  });

  // Load the Morning Scenes Objects
  window.setTimeout(function () {
    loadShip();
    loadIsland();
    loadWhale();
    loadBarrel(-45, 2, 100);
    //loadBarrel(-48,2,120);
    loadBarrel(-10, 2, 120);
    loadGrass();
    scene.add(water);
    scene.add(skyBox);
  }, 0);



  // Enabling Shadowmapping
  renderer.shadowMap.enabled = true;


  // Create the Camera
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

  // Set the Camera's Position
  camera.position.x = -30;
  camera.position.y = 5;
  camera.position.z = 170;  //was 120
  camera.lookAt(scene.position);

  // Load Ocean's background track
  var audioListener = new THREE.AudioListener();
  camera.add(audioListener);
  var sound = new THREE.Audio(audioListener);
  var audioLoader = new THREE.AudioLoader();
  audioLoader.load('sounds/ocean-wave-2.mp3', function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(1.5);
    sound.play();
  });

  // Camera Controlling 
  var trackballControls = initTrackballControls(camera, renderer);
  var clock = new THREE.Clock();

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 5, 0);



  // Ambient Light
  var light = new THREE.DirectionalLight(0x404040, 0.8);
  scene.add(light);
  var ambient_light = new THREE.AmbientLight(0x404080, 1);
  scene.add(ambient_light);

  // Adding Spotlights for the Shadows
  var spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(0, 0, 0);
  spotLight.castShadow = true;
  scene.add(spotLight);


  // Water Configuration using Water Library
  {
    var waterGeometry = new THREE.PlaneBufferGeometry(1000, 1000, 10, 10);

    water = new Water(
      waterGeometry,
      {
        textureWidth: 4096,
        textureHeight: 2160,
        waterNormals: new THREE.TextureLoader().load("textures/water/waternormals.jpg", function (texture) {

          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

        }),
        alpha: 0,
        sunDirection: light.position.clone().normalize(),
        sunColor: 0xffff00,
        waterColor: 0x27B9FF,
        distortionScale: 3.7,
        fog: scene.fog !== undefined
      }
    );
    water.material.uniforms['config'].value.w = 10;
    water.rotation.x = - Math.PI / 2;
  }


  // Scene Controller GUI Box
  const gui = new GUI();

  gui.addColor(params, 'color').onChange(function (value) {

    water.material.uniforms['color'].value.set(value);

  });
  gui.add(params, 'scale', 1, 10).onChange(function (value) {

    water.material.uniforms['config'].value.w = value;

  });
  gui.add(params, 'flowX', - 1, 1).step(0.01).onChange(function (value) {

    water.material.uniforms['flowDirection'].value.x = value;
    water.material.uniforms['flowDirection'].value.normalize();

  });
  gui.add(params, 'flowY', - 1, 1).step(0.01).onChange(function (value) {

    water.material.uniforms['flowDirection'].value.y = value;
    water.material.uniforms['flowDirection'].value.normalize();

  });
  gui.add(controls1, 'rotationSpeed', 0, 0.5);
  gui.open();
  function loadShark() {

    {
      const gltfLoader = new GLTFLoader();
      gltfLoader.load('models/great_white_shark/scene.gltf', function (object) {
        var model = object.scene;
        model.scale.set(2.5, 2.5, 2.5);
        model.position.set(-1, -1.2, 105);
        model.rotation.y = -1.1;
        scene.add(model);
        requestAnimationFrame(moveShark.bind(moveShark, model));

      }, undefined, function (e) {

        console.error(e);

      });
    }
  }


  function loadWhale() {

    {
      const gltfLoader = new GLTFLoader();
      gltfLoader.load('models/whale_shark/scene.gltf', function (object) {
        var model = object.scene;
        model.scale.set(0.1, 0.1, 0.1);
        model.position.set(-60, -1, -45);
        scene.add(model);
        requestAnimationFrame(moveWhale.bind(moveWhale, model));

      }, undefined, function (e) {

        console.error(e);

      });
    }
  }

  function loadShip() {

    {
      const gltfLoader = new GLTFLoader();
      gltfLoader.load('models/boat/scene.gltf', function (object) {
        var model = object.scene;
        model.scale.set(0.02, 0.02, -0.02);
        model.position.set(-55, 0.5, 130);
        model.rotation.y = 4.5;
        scene.add(model);
        requestAnimationFrame(moveShip.bind(moveShip, model));

      }, undefined, function (e) {

        console.error(e);

      });
    }
  }

  function loadIsland() {
    {

      const gltfLoader = new GLTFLoader();
      gltfLoader.load('models/lonelypenguin/scene.gltf', function (object) {
        var model = object.scene;
        model.scale.set(1.5, 1.5, 1.5);
        model.position.set(0, 15, -400);
        model.rotation.y = 5;
        scene.add(model);

      }, undefined, function (e) {

        console.error(e);

      });
      const gltfLoader2 = new GLTFLoader();
      gltfLoader2.load('models/penguin/scene.gltf', function (object) {
        var model = object.scene;
        model.scale.set(0.3, 0.3, 0.3);
        model.position.set(250, -70, -150);
        model.rotation.y = 5.5;
        scene.add(model);

      }, undefined, function (e) {

        console.error(e);

      });
    }
  }
  function loadBarrel(x, y, z) {
    {

      const gltfLoader = new GLTFLoader();
      gltfLoader.load('models/barrel/scene.gltf', function (object) {
        var model = object.scene;
        model.scale.set(1.8, 1.8, 1.8);
        model.position.set(x, y, z);
        scene.add(model);
        requestAnimationFrame(moveBarrel.bind(moveBarrel, model));

      }, undefined, function (e) {

        console.error(e);

      });
    }
  }
  var textureLoader = new THREE.TextureLoader();
  var tex = textureLoader.load("textures/Fire.png");
  var fire = new firefunc( tex );
  fire.scale.set(1.5, 1.5,1.5);
  fire.position.set( 0,1, 0 );
  //fire.position.x = -20.0;

  scene.add( fire );

   function loadGrass() {
     {

       const gltfLoader = new GLTFLoader();
       gltfLoader.load('models/grass/scene.gltf', function (object) {
         var model = object.scene;
         model.scale.set(6, 6, 6);
         model.position.set(25, 6.9, 112);
         scene.add(model);

       }, undefined, function (e) {

        console.error(e);

       });

    }
  }

  // Morning Skybox Cube
  var cubeGeometry = new THREE.CubeGeometry(1200, 1000, 1200);
  var cubeMaterial = [

    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("textures/morning/morning_ft.png"), side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("textures/morning/morning_bk.png"), side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("textures/morning/morning_up.png"), side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("textures/morning/morning_dn.png"), side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("textures/morning/morning_rt.png"), side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("textures/morning/morning_lt.png"), side: THREE.BackSide })
  ];
  var skyBox = new THREE.Mesh(cubeGeometry, cubeMaterial);


  // Change the Scene Mode to Night
  window.setTimeout(function () {
    // Remove the morning theme
    scene.remove(skyBox);

    cubeGeometry.dispose();
    // Night Skybox Cube
    var nightCube = new THREE.CubeGeometry(1200, 1000, 1200);
    var nightCubeMaterial = [
      new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("textures/night/nightsky_ft.png"), side: THREE.BackSide }),
      new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("textures/night/nightsky_bk.png"), side: THREE.BackSide }),
      new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("textures/night/nightsky_up.png"), side: THREE.BackSide }),
      new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("textures/night/nightsky_dn.png"), side: THREE.BackSide }),
      new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("textures/night/nightsky_rt.png"), side: THREE.BackSide }),
      new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("textures/night/nightsky_lf.png"), side: THREE.BackSide })
    ];
    var nightSkyBox = new THREE.Mesh(nightCube, nightCubeMaterial);
    scene.add(nightSkyBox);

    var audioListener = new THREE.AudioListener();
    camera.add(audioListener);
    var sound = new THREE.Audio(audioListener);
    var audioLoader = new THREE.AudioLoader();
    audioLoader.load('sounds/wave.mp3', function (buffer) {
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(3);
      sound.play();
    });
  }, 10000);

  // Snow Point Geometry
  var pointGeometry = new THREE.Geometry();
  for (var i = 0; i < 1000000; i++) {
    var point = new THREE.Vector3();
    point.x = (Math.random() * 800) - 400;
    point.y = (Math.random() * 800) - 400;
    point.z = (Math.random() * 800) - 400;
    pointGeometry.vertices.push(point);
  }
  var snowDrop = new THREE.TextureLoader().load('textures/snow.png');
  snowDrop.wrapS = snowDrop.wrapT = THREE.RepeatWrapping;
  var pointMaterial = new THREE.PointsMaterial({ color: 'rgba(174,194,224)', size: 1.5, map: snowDrop });
  pointMaterial.alphaTest = 0.5;
  var snow = new THREE.Points(pointGeometry, pointMaterial);
  snow.scale.y = 8.0;

  window.setTimeout(function () {
    scene.add(snow);
    loadShark();
  }, 10000);

  controls.update();


  // Add Lights to Objects
  {
    const skyColor = 0xB1E1FF;
    const groundColor = 0xB97A20;
    const intensity = 1;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function moveShark(object) {
    object.position.x -= 0.1;
    if (object.position.x >= -33) {
      requestAnimationFrame(moveShark.bind(moveShark, object));
    }
    else {
      object.position.x -= 0.2;
      object.position.y -= 0.05;
      requestAnimationFrame(moveShark.bind(moveShark, object));
    }

  }

  function moveWhale(object) {
    if (object.position.x >= -20) {
      object.position.x += 0.05;

      object.position.z += 0.2;
      requestAnimationFrame(moveWhale.bind(moveWhale, object));
    }
    else {
      object.position.z += 0.2;
      requestAnimationFrame(moveWhale.bind(moveWhale, object));
    }

  }

  function moveBarrel(object) {
    object.position.y = Math.cos(x) - 1;
    x += 0.02;
    requestAnimationFrame(moveBarrel.bind(moveBarrel, object));
  }

  function moveShip(object) {
    object.position.x += controls1.rotationSpeed;
    requestAnimationFrame(moveShip.bind(moveShip, object));
  }

  // Rendering Scene function
  function render() {
    trackballControls.update(clock.getDelta());

    snow.position.y -= 0.2;
    if (snow.position.y == -400) snow.position.y = 400;


    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

  // Window Resizing Function
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

  }

  // Camera Controlling Function
  function initTrackballControls(camera, renderer) {
    var trackballControls = new TrackballControls(camera, renderer.domElement);
    trackballControls.rotateSpeed = 1.0;
    trackballControls.zoomSpeed = 1.2;
    trackballControls.panSpeed = 0.8;
    trackballControls.noZoom = false;
    trackballControls.noPan = false;
    trackballControls.staticMoving = true;
    trackballControls.dynamicDampingFactor = 0.3;
    trackballControls.keys = [65, 83, 68];

    return trackballControls;
  }
}

main();
