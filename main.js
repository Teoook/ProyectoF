import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128/build/three.module.js';


/* ESCENA */

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.002);


/* CAMARA */

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    1000
);

camera.position.z = 5;


/* RENDER */

const renderer = new THREE.WebGLRenderer({
    alpha: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setClearColor(0x000000);

document.body.appendChild(
    renderer.domElement
);



/* LUCES */

const ambient = new THREE.AmbientLight(
    0x333333
);

scene.add(ambient);


const lightning = new THREE.PointLight(
    0xffffff,
    0,
    600
);

lightning.position.set(
    0,
    120,
    100
);

scene.add(lightning);



/* NUBES */

const clouds = [];

const loader =
    new THREE.TextureLoader();

loader.load(
    '/rain.webp',
    function(texture){

        const cloudMaterial =
            new THREE.MeshLambertMaterial({
                map: texture,
                transparent: true,
                opacity: 0.45,
                depthWrite: false
            });

        const cloudGeometry =
            new THREE.PlaneGeometry(
                650,
                650
            );

        for(let i = 0; i < 35; i++){

            const cloud =
                new THREE.Mesh(
                    cloudGeometry,
                    cloudMaterial
                );

            cloud.position.set(
                Math.random() * 800 - 400,
                70 + Math.random() * 40,
                -180 - Math.random() * 80
            );

            cloud.rotation.x =
                Math.PI / 2;

            cloud.rotation.z =
                Math.random() * Math.PI;

            scene.add(cloud);
            clouds.push(cloud);
        }
    }
);



/* ANIMACION */

function animate(){

    requestAnimationFrame(animate);

    // Animacion nubes
    clouds.forEach((cloud) => {
        cloud.rotation.z += 0.0008;
    });

    // Relampagos
    if(Math.random() > 0.985){

        lightning.position.set(
            Math.random() * 200 - 100,
            100,
            100
        );

        lightning.power =
            250 + Math.random() * 300;

    } else {

        lightning.power *= 0.92;
    }


    renderer.render(
        scene,
        camera
    );
}

animate();



/* BOTONES */

document
.getElementById("playBtn")
.addEventListener(
    "click",
    ()=>{
        window.location.href =
            "juego.html";
    }
);


document
.getElementById("settingsBtn")
.addEventListener(
    "click",
    ()=>{
        window.location.href =
            "settings.html";
    }
);


document
.getElementById("exitBtn")
.addEventListener(
    "click",
    ()=>{
        window.location.href =
            "exit.html";
    }
);



/* RESPONSIVE */

window.addEventListener(
    'resize',
    ()=>{

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);