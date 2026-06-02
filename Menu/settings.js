import * as THREE from 'three';

const bgMusic = document.getElementById("bgMusic");



// ESCENA 3D

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x010105);
scene.fog = new THREE.FogExp2(0x010105, 0.02);

const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.3,
    900
);

camera.position.set(0, 1.6, 5.0);
camera.lookAt(0, 3.5, -2);

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);



// ILUMINACIÓN

const ambient = new THREE.AmbientLight(0x220000, 0.2);
scene.add(ambient);

const mainLight = new THREE.DirectionalLight(0x884444, 0.35);
mainLight.position.set(3, 8, -2);
scene.add(mainLight);

const fillLight = new THREE.PointLight(0x442222, 0.2);
fillLight.position.set(0, -1, 3);
scene.add(fillLight);

const lightningLight = new THREE.PointLight(0xffffff, 0, 50);
lightningLight.position.set(0, 6, 5);
scene.add(lightningLight);


// MATERIALES

const greyMat = new THREE.MeshStandardMaterial({
    color: 0x4a4a4a,
    roughness: 0.6,
    metalness: 0.2
});

const darkGreyMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.8
});

function addBuilding(x, z, width, depth, height, material) {
    const geometry = new THREE.BoxGeometry(width, height, depth);

    const building = new THREE.Mesh(
        geometry,
        material
    );

    building.position.set(
        x,
        -6 + height / 2,
        z
    );

    scene.add(building);
}



// EDIFICIOS

for (let i = 0; i < 130; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = 18 + Math.random() * 6;

    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;

    const h = 6 + Math.random() * 9;
    const w = 0.7 + Math.random() * 1.3;
    const d = 0.7 + Math.random() * 1.3;

    addBuilding(
        x,
        z,
        w,
        d,
        h,
        Math.random() > 0.6 ? greyMat : darkGreyMat
    );
}


// UI SETTINGS

function updateValues() {
    const musicSlider =
        document.getElementById("musicVolume");

    const sfxSlider =
        document.getElementById("sfxVolume");

    const musicLabel =
        document.getElementById("musicValue");

    const sfxLabel =
        document.getElementById("sfxValue");

    if (musicLabel) {
        musicLabel.textContent =
            musicSlider.value + "%";
    }

    if (sfxLabel) {
        sfxLabel.textContent =
            sfxSlider.value + "%";
    }
}



document.getElementById("musicVolume")
    .addEventListener("input", () => {

        updateValues();

        if (bgMusic) {
            bgMusic.volume =
                document.getElementById("musicVolume").value / 100;
        }
    });

document.getElementById("sfxVolume")
    .addEventListener("input", updateValues);



// APPLY BUTTON

document.getElementById("applyBtn")
.addEventListener("click", () => {

    const musicValue =
        document.getElementById("musicVolume").value;

    const sfxValue =
        document.getElementById("sfxVolume").value;

    const config = {
        music: musicValue,
        sfx: sfxValue
    };

    localStorage.setItem(
        "zombieAudioConfig",
        JSON.stringify(config)
    );

    if (bgMusic) {
        bgMusic.volume = musicValue / 100;
    }

    const panel =
        document.querySelector(".settings-container");

    panel.style.transform =
        "translate(-50%, -50%) scale(0.98)";

    setTimeout(() => {
        panel.style.transform =
            "translate(-50%, -50%) scale(1)";
    }, 120);
});



// RESET BUTTON

document.getElementById("resetBtn")
.addEventListener("click", () => {

    document.getElementById("musicVolume").value = 90;
    document.getElementById("sfxVolume").value = 90;

    updateValues();

    if (bgMusic) {
        bgMusic.volume = 0.9;
    }
});



// BACK BUTTON

document.getElementById("backBtn")
.addEventListener("click", () => {
    window.location.href =
        "/Menu/PantallaInicio.html";
});


// CARGAR CONFIG

const savedConfig =
    localStorage.getItem("zombieAudioConfig");

if (savedConfig) {

    const config =
        JSON.parse(savedConfig);

    document.getElementById("musicVolume").value =
        config.music;

    document.getElementById("sfxVolume").value =
        config.sfx;
}


// mostrar % apenas abre
updateValues();


// aplicar volumen apenas entra
if (bgMusic) {

    bgMusic.volume =
        document.getElementById("musicVolume").value / 100;

    bgMusic.play().catch(() => {
        document.addEventListener("click", () => {
            bgMusic.play();
        }, { once: true });
    });
}



// RESIZE

window.addEventListener("resize", () => {

    camera.aspect =
        window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
});



// ANIMATE

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();