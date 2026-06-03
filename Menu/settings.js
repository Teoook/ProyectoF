import * as THREE from 'three';

const bgMusic = document.getElementById("bgMusic");



// ESCENA 3D

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x010105);
scene.fog = new THREE.FogExp2(0x010105, 0.02);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.3, 900);
camera.position.set(0, 1.6, 5.0);
camera.lookAt(0, 3.5, -2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
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
const greyMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.6, metalness: 0.2 });
const darkGreyMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.8 });

function addBuilding(x, z, width, depth, height, material) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const building = new THREE.Mesh(geometry, material);
    building.position.set(x, -6 + height / 2, z);
    building.castShadow = true;
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
    const mat = Math.random() > 0.6 ? greyMat : darkGreyMat;
    addBuilding(x, z, w, d, h, mat);
}

for (let i = 0; i < 200; i++) {
    let x = (Math.random() - 0.5) * 24;
    let z = -3 - Math.random() * 8;
    if (Math.random() > 0.7) {
        x = (Math.random() > 0.5 ? 4 : -4) + (Math.random() - 0.5) * 2.5;
        z = -1.5 - Math.random() * 5;
    }
    const h = 6 + Math.random() * 10;
    const w = 0.8 + Math.random() * 1.6;
    const d = 0.8 + Math.random() * 1.6;
    const mat = Math.random() > 0.5 ? greyMat : darkGreyMat;
    addBuilding(x, z, w, d, h, mat);
}

for (let i = 0; i < 40; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = 15 + Math.random() * 6;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const h = 12 + Math.random() * 8;
    addBuilding(x, z, 1, 1, h, new THREE.MeshStandardMaterial({ color: 0x3a3a3a, emissive: 0x111111 }));
}

// NUBES
function createFluffyCloud(x, y, z, scale) {
    const group = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xccccdd, emissive: 0x111111, transparent: true, opacity: 0.7 });
    const numSpheres = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numSpheres; i++) {
        const size = 0.3 + Math.random() * 0.5;
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(size, 6, 6), cloudMat);
        sphere.position.set((Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.8);
        group.add(sphere);
    }
    group.position.set(x, y, z);
    group.scale.setScalar(scale);
    scene.add(group);
    return group;
}

const cloudGroup = [];
for (let i = 0; i < 70; i++) {
    const x = (Math.random() - 0.5) * 60;
    const y = 3.0 + Math.random() * 3.0;
    const z = -2 - Math.random() * 18;
    const scale = 0.4 + Math.random() * 0.6;
    const cloud = createFluffyCloud(x, y, z, scale);
    cloud.userData = { driftX: (Math.random() - 0.5) * 0.003, driftY: (Math.random() - 0.5) * 0.002 };
    cloudGroup.push(cloud);
}

// LLUVIA
const createRainTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(140, 150, 170, 0.9)');
    gradient.addColorStop(0.4, 'rgba(90, 100, 120, 0.7)');
    gradient.addColorStop(1, 'rgba(50, 60, 80, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(4, 0, canvas.width-8, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
};

const rainTexture = createRainTexture();
const rainCount = 7500;
const rainGeometry = new THREE.BufferGeometry();
const rainPositions = new Float32Array(rainCount * 3);
const rainVelocities = [];
for (let i = 0; i < rainCount; i++) {
    rainPositions[i*3] = (Math.random() - 0.5) * 80;
    rainPositions[i*3+1] = Math.random() * 28;
    rainPositions[i*3+2] = (Math.random() - 0.5) * 60 - 20;
    rainVelocities.push(0.22 + Math.random() * 0.25);
}
rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
const rainMaterial = new THREE.PointsMaterial({ color: 0x9aabbc, map: rainTexture, size: 0.28, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending });
const rainSystem = new THREE.Points(rainGeometry, rainMaterial);
scene.add(rainSystem);

// NIEBLA
const mistCount = 3500;
const mistGeometry = new THREE.BufferGeometry();
const mistPositions = new Float32Array(mistCount * 3);
for (let i = 0; i < mistCount; i++) {
    mistPositions[i*3] = (Math.random() - 0.5) * 70;
    mistPositions[i*3+1] = Math.random() * 3.5;
    mistPositions[i*3+2] = (Math.random() - 0.5) * 50 - 15;
}
mistGeometry.setAttribute('position', new THREE.BufferAttribute(mistPositions, 3));
const mistMaterial = new THREE.PointsMaterial({ color: 0x552222, size: 0.12, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending });
const mistSystem = new THREE.Points(mistGeometry, mistMaterial);
scene.add(mistSystem);

// RELAMPAGOS
let lightningTimer = 0;
let lightningIntensityVal = 1.0;
let shakeTimer = 0;
let time = 0;
let targetAmbient = 0.2, targetMainLight = 0.35, targetFillLight = 0.2, targetBgHex = 0x010105;
let isRestoring = false;

// MOUSE
let mouseX = 0, mouseY = 0, targetCameraX = 0, targetCameraY = 0, currentCameraX = 0, currentCameraY = 0;
window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    targetCameraX = mouseX * 0.5;
    targetCameraY = mouseY * 0.35;
});

// FUNCIONES UI
function updateValues() {
    const music = document.getElementById('musicVolume');
    const sfx = document.getElementById('sfxVolume');
    
    document.getElementById('musicValue').innerText = music.value + '%';
    document.getElementById('sfxValue').innerText = sfx.value + '%';
}

document.getElementById('musicVolume').addEventListener('input', updateValues);
document.getElementById('sfxVolume').addEventListener('input', updateValues);

// BOTONES
document.getElementById('applyBtn').addEventListener('click', () => {
    const config = {
        music: document.getElementById('musicVolume').value,
        sfx: document.getElementById('sfxVolume').value
    };
    console.log(' Configuración guardada:', config);
    localStorage.setItem('zombieAudioConfig', JSON.stringify(config));
    
    const panel = document.querySelector('.settings-container');
    panel.style.transform = 'translate(-50%, -50%) scale(0.98)';
    setTimeout(() => { panel.style.transform = 'translate(-50%, -50%) scale(1)'; }, 120);
});

document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('musicVolume').value = 90;
    document.getElementById('sfxVolume').value = 90;
    updateValues();
    
    const panel = document.querySelector('.settings-container');
    panel.style.borderColor = '#cc4a4a';
    setTimeout(() => { panel.style.borderColor = '#8a1a1a'; }, 300);
});

// VOLVER MENU
document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = "/Menu/PantallaInicio.html";  
});

// CARGAR CONFIGURACIÓN GUARDADA
const savedConfig = localStorage.getItem('zombieAudioConfig');
if (savedConfig) {
    const config = JSON.parse(savedConfig);
    document.getElementById('musicVolume').value = config.music;
    document.getElementById('sfxVolume').value = config.sfx;
    updateValues();
}

// RESIZE
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ANIMACIÓN
function animate() {
    requestAnimationFrame(animate);
    time += 0.016;

    // NUBES
    cloudGroup.forEach(cloud => {
        cloud.position.x += cloud.userData.driftX;
        cloud.position.y += cloud.userData.driftY;
        if (Math.abs(cloud.position.x) > 35) cloud.userData.driftX *= -1;
        if (cloud.position.y > 5 || cloud.position.y < 1.2) cloud.userData.driftY *= -1;
    });

    // LLUVIA
    const positions = rainGeometry.attributes.position.array;
    for (let i = 0; i < rainCount; i++) {
        let y = positions[i*3+1] - rainVelocities[i];
        if (y < -2) {
            y = 27;
            positions[i*3] = (Math.random() - 0.5) * 80;
            positions[i*3+2] = (Math.random() - 0.5) * 60 - 20;
        }
        positions[i*3+1] = y;
    }
    rainGeometry.attributes.position.needsUpdate = true;

    // NIEBLA
    const mistPos = mistGeometry.attributes.position.array;
    for (let i = 0; i < mistCount; i++) {
        mistPos[i*3] += 0.002;
        if (mistPos[i*3] > 35) mistPos[i*3] = -35;
    }
    mistGeometry.attributes.position.needsUpdate = true;

    // RELÁMPAGOS (fijos, no dependen de sliders)
    if (Math.random() > 0.993 && lightningTimer <= 0 && !isRestoring) {
        lightningIntensityVal = 1.0 + Math.random() * 1.5;
        lightningTimer = 0.13;
        lightningLight.position.x = (Math.random() - 0.5) * 16;
        lightningLight.position.y = 5 + Math.random() * 8;
        lightningLight.intensity = lightningIntensityVal;
        ambient.intensity = 0.6;
        mainLight.intensity = 0.9;
        fillLight.intensity = 0.7;
        scene.background.setHex(0x442222);
        shakeTimer = 0.12;
        targetAmbient = 0.2;
        targetMainLight = 0.35;
        targetFillLight = 0.2;
        targetBgHex = 0x010105;
        isRestoring = true;
    }

    if (lightningTimer > 0) {
        lightningTimer -= 0.016;
        lightningLight.intensity = lightningIntensityVal * (lightningTimer / 0.13);
        if (lightningTimer <= 0) lightningLight.intensity = 0;
    } else {
        lightningLight.intensity *= 0.95;
        if (lightningLight.intensity < 0.01) lightningLight.intensity = 0;
    }

    if (isRestoring) {
        ambient.intensity += (targetAmbient - ambient.intensity) * 0.018;
        mainLight.intensity += (targetMainLight - mainLight.intensity) * 0.018;
        fillLight.intensity += (targetFillLight - fillLight.intensity) * 0.018;
        const currentBg = new THREE.Color(scene.background);
        const targetBg = new THREE.Color(targetBgHex);
        currentBg.lerp(targetBg, 0.018);
        scene.background = currentBg;
        if (Math.abs(ambient.intensity - targetAmbient) < 0.008) isRestoring = false;
    }

    // SHAKE
    let shakeX = 0, shakeY = 0;
    if (shakeTimer > 0) {
        shakeTimer -= 0.016;
        const intensity = Math.min(0.05, shakeTimer * 0.4 + 0.02);
        shakeX = (Math.random() - 0.5) * intensity;
        shakeY = (Math.random() - 0.5) * intensity;
    }

    // CÁMARA
    currentCameraX += (targetCameraX - currentCameraX) * 0.07;
    currentCameraY += (targetCameraY - currentCameraY) * 0.07;
    camera.position.x = currentCameraX + shakeX;
    camera.position.y = 1.6 + currentCameraY * 0.3 + Math.sin(time * 1.3) * 0.008 + shakeY;
    camera.lookAt(currentCameraX * 0.7, 3.8 + currentCameraY * 0.5 + Math.sin(time * 0.8) * 0.05, -2);

    renderer.render(scene, camera);
}

animate();