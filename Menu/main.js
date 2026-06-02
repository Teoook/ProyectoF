import * as THREE from 'three';


// escena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x010105);
scene.fog = new THREE.FogExp2(0x010105, 0.02);

// camara pero inclinada pa q se vea algo
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.3, 900);
camera.position.set(0, 1.6, 5.0);
camera.lookAt(0, 3.5, -2);


// renderizador creo que era
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// iluminacion
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

// edificios
const greyMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.6, metalness: 0.2 });
const darkGreyMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.8 });

function addBuilding(x, z, width, depth, height, material) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const building = new THREE.Mesh(geometry, material);
    building.position.set(x, -6 + height / 2, z);
    building.castShadow = true;
    scene.add(building);
}

// anillo exterior
for (let i = 0; i < 150; i++) {
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
// edificios cerca
for (let i = 0; i < 250; i++) {
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
// rascacielos
for (let i = 0; i < 50; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = 15 + Math.random() * 6;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const h = 12 + Math.random() * 8;
    addBuilding(x, z, 1, 1, h, new THREE.MeshStandardMaterial({ color: 0x3a3a3a, emissive: 0x111111 }));
}

// nubes pequeñas y separaas (ve laura revisate esto que aveces las nubes salen mal)
function createFluffyCloud(x, y, z, scale) {
    const group = new THREE.Group();
    // Cada nube tendra menos esferas para que sea mas pequeña y ligera
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xccccdd, emissive: 0x111111, transparent: true, opacity: 0.7 });
    const numSpheres = 3 + Math.floor(Math.random() * 4); // entre 3 y 6 esferas (corregido de antes que eran 6-10)
    for (let i = 0; i < numSpheres; i++) {
        const size = 0.3 + Math.random() * 0.5; // esferas más pequeñas
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(size, 6, 6), cloudMat);
        sphere.position.set(
            (Math.random() - 0.5) * 0.8,
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.8
        );
        group.add(sphere);
    }
    group.position.set(x, y, z);
    group.scale.setScalar(scale);
    scene.add(group);
    return group;
}

const cloudGroup = [];
const cloudCount = 80; // muchas nubes
for (let i = 0; i < cloudCount; i++) {
    // Distribución mucho mas amplia para que no se amontonen
    const x = (Math.random() - 0.5) * 60;  // rango mayor: -30 a 30
    const y = 3.0 + Math.random() * 3.0;   // entre 3 y 6
    const z = -2 - Math.random() * 18;     // entre -2 y -20 (mas dispersas en profundidad)
    const scale = 0.4 + Math.random() * 0.6; // escala pequeña: 0.4 a 1.0
    const cloud = createFluffyCloud(x, y, z, scale);
    cloud.userData = { 
        driftX: (Math.random() - 0.5) * 0.003, 
        driftY: (Math.random() - 0.5) * 0.002 
    };
    cloudGroup.push(cloud);
}

// lluvia exagerada como de 9mil particulas creo (si da bajones de fps revisar esto)
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
const rainCount = 9000;
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

// niebla mela
const mistCount = 4000;
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

// relampagos con fundido
let lightningTimer = 0;
let lightningIntensity = 0;
let shakeTimer = 0;
let time = 0;

// restauración lenta (mas de 1 segundo)
let targetAmbient = 0.2;
let targetMainLight = 0.35;
let targetFillLight = 0.2;
let targetBgHex = 0x010105;
let lightTransitionSpeed = 0.015; // muy lento (aprox 1 segundo para completar)
let isRestoring = false;

let mouseX = 0, mouseY = 0;
let targetCameraX = 0, targetCameraY = 0;
let currentCameraX = 0, currentCameraY = 0;

window.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = (event.clientY / window.innerHeight) * 2 - 1;
    targetCameraX = mouseX * 0.5;
    targetCameraY = mouseY * 0.35;
});

// botones
document.getElementById('playBtn').addEventListener('click', () => window.location.href = "/index.html");
document.getElementById('settingsBtn').addEventListener('click', () => window.location.href = 'settings.html');
document.getElementById('exitBtn').addEventListener('click', () => window.location.href = 'exit.html');

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// animacion
function animate() {
    requestAnimationFrame(animate);
    time += 0.016;

    // Nubes (mas rapidas por estar bajas)
    cloudGroup.forEach(cloud => {
        cloud.position.x += cloud.userData.driftX;
        cloud.position.y += cloud.userData.driftY;
        if (Math.abs(cloud.position.x) > 35) cloud.userData.driftX *= -1;
        if (cloud.position.y > 5 || cloud.position.y < 1.2) cloud.userData.driftY *= -1;
    });

    // Lluvia
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

    // Niebla baja
    const mistPos = mistGeometry.attributes.position.array;
    for (let i = 0; i < mistCount; i++) {
        mistPos[i*3] += 0.002;
        if (mistPos[i*3] > 35) mistPos[i*3] = -35;
    }
    mistGeometry.attributes.position.needsUpdate = true;

    // Relampago
    if (Math.random() > 0.993 && lightningTimer <= 0 && !isRestoring) {
        lightningIntensity = 1.0 + Math.random() * 1.5;
        lightningTimer = 0.13;
        lightningLight.position.x = (Math.random() - 0.5) * 16;
        lightningLight.position.y = 5 + Math.random() * 8;
        lightningLight.intensity = lightningIntensity;
        // Flash: luces altas
        ambient.intensity = 0.6;
        mainLight.intensity = 0.9;
        fillLight.intensity = 0.7;
        scene.background.setHex(0x442222);
        shakeTimer = 0.12;
        // Iniciar restauracion lenta
        targetAmbient = 0.2;
        targetMainLight = 0.35;
        targetFillLight = 0.2;
        targetBgHex = 0x010105;
        isRestoring = true;
        lightTransitionSpeed = 0.012; // muy lento (~1.3 segundos)
    }

    if (lightningTimer > 0) {
        lightningTimer -= 0.016;
        lightningLight.intensity = lightningIntensity * (lightningTimer / 0.13);
        if (lightningTimer <= 0) {
            lightningLight.intensity = 0;
        }
    } else {
        lightningLight.intensity *= 0.95;
        if (lightningLight.intensity < 0.01) lightningLight.intensity = 0;
    }

    // Restauracion lenta de las luces (fundido largo)
    if (isRestoring) {
        ambient.intensity += (targetAmbient - ambient.intensity) * lightTransitionSpeed;
        mainLight.intensity += (targetMainLight - mainLight.intensity) * lightTransitionSpeed;
        fillLight.intensity += (targetFillLight - fillLight.intensity) * lightTransitionSpeed;
        const currentBg = new THREE.Color(scene.background);
        const targetBg = new THREE.Color(targetBgHex);
        currentBg.lerp(targetBg, lightTransitionSpeed);
        scene.background = currentBg;
        // Cuando este cerca, termina la restauracion
        if (Math.abs(ambient.intensity - targetAmbient) < 0.01) {
            isRestoring = false;
            ambient.intensity = targetAmbient;
            mainLight.intensity = targetMainLight;
            fillLight.intensity = targetFillLight;
            scene.background.setHex(targetBgHex);
        }
    }

    // Vibracion de camara bien melo asi bien bacano pero melo
    let shakeX = 0, shakeY = 0;
    if (shakeTimer > 0) {
        shakeTimer -= 0.016;
        const intensity = Math.min(0.06, shakeTimer * 0.5 + 0.03);
        shakeX = (Math.random() - 0.5) * intensity;
        shakeY = (Math.random() - 0.5) * intensity;
    }

    // camara con cursor (camara que enfoca a mi, camara que enfoca a antonio)
    currentCameraX += (targetCameraX - currentCameraX) * 0.07;
    currentCameraY += (targetCameraY - currentCameraY) * 0.07;
    camera.position.x = currentCameraX + shakeX;
    camera.position.y = 1.6 + currentCameraY * 0.3 + Math.sin(time * 1.3) * 0.008 + shakeY;
    camera.lookAt(currentCameraX * 0.7, 3.8 + currentCameraY * 0.5 + Math.sin(time * 0.8) * 0.05, -2);

    renderer.render(scene, camera);
}

animate();