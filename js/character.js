import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";

/*
 * The fixed full-screen canvas: Sam's character + floating dust.
 * main.js animates `view` with GSAP as the page scrolls; this module only reads it.
 *   x      horizontal position as a fraction of the visible width (wide screens only)
 *   y      vertical offset in world units
 *   scale  uniform scale
 *   rotY   turn of the whole character, radians
 *   vis    0 hides the character (and the glow / spotlight), 1 shows it
 *   monitor 0..1: pops the monitor in and makes the character look at it
 */
export const view = { x: -0.25, y: 0, scale: 1, rotY: 0, vis: 1, monitor: 0 };

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
if (finePointer) document.documentElement.classList.add("orb-on");

const canvas = document.getElementById("scene");
const orb = document.getElementById("orb");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, finePointer ? 2 : 1.5)); // phones: fewer pixels to shade
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
const LOOK_AT_Y = 0.35;

/* ---------- materials ---------- */
const skin = new THREE.MeshPhysicalMaterial({
	color: 0xe6b08c, roughness: 0.55, clearcoat: 0.3, clearcoatRoughness: 0.5, envMapIntensity: 0.45,
});
const hairMat = new THREE.MeshPhysicalMaterial({
	color: 0x15121c, roughness: 0.4, clearcoat: 0.7, clearcoatRoughness: 0.25, envMapIntensity: 0.6,
});
const hoodieMat = new THREE.MeshStandardMaterial({ color: 0x2a2833, roughness: 0.9, envMapIntensity: 0.3 });
const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25, envMapIntensity: 0.4 });
const irisMat = new THREE.MeshStandardMaterial({ color: 0x1f130d, roughness: 0.2, envMapIntensity: 0.5 });
const lipMat = new THREE.MeshStandardMaterial({ color: 0x8c3f3b, roughness: 0.5, envMapIntensity: 0.3 });

/* ---------- character ---------- */
const rig = new THREE.Group();
scene.add(rig);

const character = new THREE.Group();
rig.add(character);

const torsoGroup = new THREE.Group();
character.add(torsoGroup);

const shoulders = new THREE.Mesh(new THREE.CapsuleGeometry(0.36, 1.2, 14, 32), hoodieMat);
shoulders.rotation.z = Math.PI / 2;
shoulders.scale.set(1, 1, 0.78);
shoulders.position.y = -0.1;
torsoGroup.add(shoulders);

const chest = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), hoodieMat);
chest.scale.set(0.9, 0.9, 0.46);
chest.position.y = -0.82;
torsoGroup.add(chest);

for (const side of [-1, 1]) {
	const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.27, 0.95, 12, 24), hoodieMat);
	arm.position.set(side * 0.9, -0.72, 0);
	arm.rotation.z = side * 0.12;
	arm.scale.z = 0.85;
	torsoGroup.add(arm);
}

const hoodBack = new THREE.Mesh(new THREE.SphereGeometry(0.4, 40, 32), hoodieMat);
hoodBack.scale.set(1.25, 0.8, 0.7);
hoodBack.position.set(0, 0.12, -0.2);
torsoGroup.add(hoodBack);

const collar = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.1, 24, 56), hoodieMat);
collar.rotation.x = Math.PI / 2;
collar.position.set(0, 0.1, 0.02);
torsoGroup.add(collar);

for (const side of [-1, 1]) {
	const str = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.32, 6, 12), whiteMat);
	str.position.set(side * 0.11, -0.14, 0.3);
	str.rotation.z = side * 0.06;
	torsoGroup.add(str);
}

const neckMat = skin.clone();
neckMat.color.set(0xc79877);
const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.34, 32), neckMat);
neck.position.y = 0.16;
torsoGroup.add(neck);

/* head */
const head = new THREE.Group();
head.position.y = 0.86;
character.add(head);

// one smooth head: a sphere whose lower half tapers toward the chin
function taperedHead(radius, amount) {
	let geo = new THREE.SphereGeometry(radius, 64, 48);
	geo.deleteAttribute("normal");
	geo.deleteAttribute("uv");
	geo = mergeVertices(geo);
	const p = geo.attributes.position;
	for (let i = 0; i < p.count; i++) {
		const y = p.getY(i);
		if (y < 0) {
			const s = 1 - amount * Math.pow(Math.min(1, -y / radius), 1.7);
			p.setX(i, p.getX(i) * s);
			p.setZ(i, p.getZ(i) * (1 - (1 - s) * 0.6));
		}
	}
	geo.computeVertexNormals();
	return geo;
}

const skull = new THREE.Mesh(taperedHead(0.62, 0.3), skin);
skull.scale.set(1, 1.08, 1);
skull.position.y = -0.03;
head.add(skull);

for (const side of [-1, 1]) {
	const ear = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 16), skin);
	ear.scale.set(0.5, 1, 0.8);
	ear.position.set(side * 0.64, -0.1, -0.02);
	head.add(ear);
}

const blushMat = new THREE.MeshBasicMaterial({ color: 0xe8806f, transparent: true, opacity: 0.3, depthWrite: false });
for (const side of [-1, 1]) {
	const blush = new THREE.Mesh(new THREE.CircleGeometry(0.075, 24), blushMat);
	blush.scale.set(1.3, 0.8, 1);
	blush.position.set(side * 0.36, -0.1, 0.495);
	blush.rotation.y = side * 0.65;
	head.add(blush);
}

/* hair */
const hairCap = new THREE.Mesh(
	new THREE.SphereGeometry(0.645, 64, 48, 0, Math.PI * 2, 0, Math.PI * 0.5),
	hairMat
);
hairCap.scale.set(1.03, 1.12, 1.07);
hairCap.rotation.x = -0.55; // high hairline in front, drops low at the nape
head.add(hairCap);

// small swept quiff, mostly buried in the cap so it reads as volume, not a separate piece
const quiff = new THREE.Mesh(new THREE.SphereGeometry(0.3, 40, 24), hairMat);
quiff.scale.set(1.25, 0.7, 1.0);
quiff.position.set(0.1, 0.55, 0.18);
quiff.rotation.set(0.4, 0, -0.2);
head.add(quiff);

/* face */
const eyeRig = []; // { group, look }
function makeEye(side) {
	const group = new THREE.Group();
	group.position.set(side * 0.22, 0.0, 0.45);

	const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.14, 32, 24), whiteMat);
	sclera.scale.set(1, 1.1, 0.9);
	group.add(sclera);

	const look = new THREE.Group();
	const iris = new THREE.Mesh(new THREE.SphereGeometry(0.088, 28, 20), irisMat);
	iris.scale.set(1, 1.05, 0.4);
	iris.position.z = 0.117;
	look.add(iris);

	const glint = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 8), whiteMat);
	glint.position.set(0.032, 0.036, 0.138);
	look.add(glint);

	group.add(look);
	head.add(group);
	eyeRig.push({ group, look });
}
makeEye(-1);
makeEye(1);

const brows = [];
for (const side of [-1, 1]) {
	const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 0.15, 6, 12), hairMat);
	brow.rotation.z = Math.PI / 2 + side * 0.14;
	brow.position.set(side * 0.225, 0.205, 0.54);
	brow.userData.baseY = 0.205;
	head.add(brow);
	brows.push(brow);
}

const nose = new THREE.Mesh(new THREE.SphereGeometry(0.07, 24, 16), skin);
nose.scale.set(1, 0.9, 0.95);
nose.position.set(0, -0.1, 0.6);
head.add(nose);

const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.014, 12, 36, Math.PI * 0.62), lipMat);
mouth.rotation.z = -Math.PI * 0.81;
mouth.position.set(0.01, -0.2, 0.555);
head.add(mouth);

/* ---------- monitor (pops in for "What I do") ---------- */
function makeScreenTexture() {
	const c = document.createElement("canvas");
	c.width = 512;
	c.height = 320;
	const g = c.getContext("2d");

	const bg = g.createLinearGradient(0, 0, 512, 320);
	bg.addColorStop(0, "#1d1636");
	bg.addColorStop(1, "#0a0813");
	g.fillStyle = bg;
	g.fillRect(0, 0, 512, 320);

	g.fillStyle = "rgba(255,255,255,0.08)";
	g.fillRect(0, 0, 512, 34);
	["#ff6b6b", "#ffd166", "#6bdc8b"].forEach((col, i) => {
		g.fillStyle = col;
		g.beginPath();
		g.arc(20 + i * 20, 17, 5, 0, Math.PI * 2);
		g.fill();
	});

	const hero = g.createLinearGradient(30, 60, 300, 170);
	hero.addColorStop(0, "#7c5cff");
	hero.addColorStop(1, "#c4b5fd");
	g.fillStyle = hero;
	g.beginPath();
	g.roundRect(30, 60, 270, 22, 8);
	g.fill();
	g.fillStyle = "#ffffff";
	g.beginPath();
	g.roundRect(30, 94, 200, 22, 8);
	g.fill();
	g.fillStyle = "rgba(255,255,255,0.35)";
	for (let i = 0; i < 3; i++) {
		g.beginPath();
		g.roundRect(30, 134 + i * 16, 250 - i * 40, 8, 4);
		g.fill();
	}
	g.fillStyle = "#8b5cf6";
	g.beginPath();
	g.roundRect(30, 196, 96, 28, 14);
	g.fill();

	g.fillStyle = "rgba(255,255,255,0.1)";
	g.beginPath();
	g.roundRect(330, 60, 150, 164, 14);
	g.fill();
	g.fillStyle = "rgba(139,92,246,0.55)";
	g.beginPath();
	g.arc(405, 118, 34, 0, Math.PI * 2);
	g.fill();

	g.fillStyle = "rgba(255,255,255,0.18)";
	for (let i = 0; i < 3; i++) {
		g.beginPath();
		g.roundRect(30 + i * 156, 250, 140, 48, 10);
		g.fill();
	}

	const tex = new THREE.CanvasTexture(c);
	tex.colorSpace = THREE.SRGBColorSpace;
	return tex;
}

const monitor = new THREE.Group();
monitor.position.set(1.4, 0.05, 0.9);
monitor.rotation.y = -0.5;
rig.add(monitor);

const monitorBody = new THREE.Mesh(
	new THREE.BoxGeometry(1.5, 0.95, 0.07),
	new THREE.MeshStandardMaterial({ color: 0x14121c, roughness: 0.4, envMapIntensity: 0.6 })
);
monitor.add(monitorBody);

const monitorScreen = new THREE.Mesh(
	new THREE.PlaneGeometry(1.4, 0.85),
	new THREE.MeshBasicMaterial({ map: makeScreenTexture(), toneMapped: false })
);
monitorScreen.position.z = 0.037;
monitor.add(monitorScreen);

const standMat = new THREE.MeshStandardMaterial({ color: 0x1d1a27, roughness: 0.5 });
const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.36, 20), standMat);
stand.position.y = -0.64;
monitor.add(stand);
const standBase = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.04, 32), standMat);
standBase.position.y = -0.82;
monitor.add(standBase);

const monitorGlow = new THREE.PointLight(0xa78bfa, 0, 4, 2);
monitorGlow.position.set(0, 0, 0.7);
monitor.add(monitorGlow);

monitor.visible = false;

/* ---------- lights ---------- */
const key = new THREE.DirectionalLight(0xfff1e6, 1.7);
key.position.set(-2.5, 3, 5);
rig.add(key);

const rimL = new THREE.PointLight(0x8b5cf6, 70, 12, 2);
rimL.position.set(-3, 1.8, -2.2);
rig.add(rimL);

const rimR = new THREE.PointLight(0x6d4aff, 55, 12, 2);
rimR.position.set(3.2, 0.7, -2);
rig.add(rimR);

const fill = new THREE.PointLight(0xb9a6ff, 10, 12, 2);
fill.position.set(2.6, 0.4, 4);
rig.add(fill);

/* ---------- dust ---------- */
const DUST = 700;
const dustPos = new Float32Array(DUST * 3);
for (let i = 0; i < DUST; i++) {
	dustPos[i * 3] = (Math.random() - 0.5) * 16;
	dustPos[i * 3 + 1] = (Math.random() - 0.5) * 10;
	dustPos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
}
const dustGeo = new THREE.BufferGeometry();
dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
const dust = new THREE.Points(
	dustGeo,
	new THREE.PointsMaterial({ color: 0xcfc4ff, size: 0.028, transparent: true, opacity: 0.7, depthWrite: false })
);
scene.add(dust);

/* ---------- layout ---------- */
const closeUp = new URLSearchParams(location.search).has("close"); // dev: ?close
const headWorld = new THREE.Vector3();
const headNdc = new THREE.Vector3();
const monitorNdc = new THREE.Vector3();
const metrics = { visibleW: 8, wide: true };

function layout() {
	const w = window.innerWidth;
	const h = window.innerHeight;
	const aspect = w / h;

	renderer.setSize(w, h, false);
	camera.aspect = aspect;

	const dist = aspect >= 1 ? 7.6 : 7.6 + (1 - aspect) * 4.5;
	const lookY = closeUp ? 0.86 : LOOK_AT_Y;
	camera.position.set(0, lookY + 0.15, closeUp ? dist * 0.5 : dist);
	camera.lookAt(0, lookY, 0);
	camera.updateProjectionMatrix();

	metrics.visibleW = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist * aspect;
	metrics.wide = w > 800 && aspect > 1.1; // same breakpoint as the CSS: text sits beside the character
}
window.addEventListener("resize", layout);
layout();

/* ---------- pointer ---------- */
const pointer = { x: 0.35, y: 0.12 }; // ndc
const orbPos = { x: window.innerWidth * 0.7, y: window.innerHeight * 0.5 };
const orbTarget = { x: orbPos.x, y: orbPos.y };

window.addEventListener("pointermove", (e) => {
	pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
	pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
	orbTarget.x = e.clientX;
	orbTarget.y = e.clientY;
	if (finePointer) orb.style.opacity = e.target.closest && e.target.closest(".contact-form") ? "0" : "1"; // normal cursor over the form
});
document.addEventListener("pointerleave", () => { orb.style.opacity = "0"; });

/* ---------- animation ---------- */
const clock = new THREE.Clock();
const smooth = { headX: 0, headY: 0, eyeX: 0, eyeY: 0, brow: 0 };
const damp = (current, target, rate, dt) => current + (target - current) * (1 - Math.exp(-rate * dt));
const clamp = THREE.MathUtils.clamp;
const rootStyle = document.documentElement.style;
let lastCx = "";
let lastVis = -1;

let nextBlink = 2.2;
let blinkStart = -1;
const BLINK_TIME = 0.16;

function frame() {
	const dt = Math.min(clock.getDelta(), 0.05);
	const t = clock.elapsedTime;

	// apply the scroll-driven view
	rig.position.x = metrics.wide && !closeUp ? view.x * metrics.visibleW : 0;
	rig.position.y = view.y + (metrics.wide ? 0 : 0.8);
	rig.rotation.y = view.rotY;
	rig.scale.setScalar(Math.max(view.scale * view.vis, 0.0001));
	rig.visible = view.vis > 0.01;

	const mon = clamp(view.monitor, 0, 1);
	monitor.visible = mon > 0.01;
	monitor.scale.setScalar(Math.max(mon, 0.0001));
	monitor.position.y = 0.05 + (reduceMotion ? 0 : Math.sin(t * 1.2) * 0.03);
	monitorGlow.intensity = mon * 14;

	rig.updateMatrixWorld(true);
	head.getWorldPosition(headWorld);
	headNdc.copy(headWorld).project(camera);

	// keep the CSS glow / spotlight under the head
	const cx = (((headNdc.x + 1) / 2) * 100).toFixed(1) + "%";
	if (cx !== lastCx) { rootStyle.setProperty("--cx", cx); lastCx = cx; }
	const vis = Math.round(view.vis * 100) / 100;
	if (vis !== lastVis) { rootStyle.setProperty("--vis", String(vis)); lastVis = vis; }

	if (rig.visible) {
		// the head tracks the cursor, or the monitor while it is on screen
		monitor.getWorldPosition(monitorNdc);
		monitorNdc.project(camera);
		let dx = clamp(pointer.x - headNdc.x, -1, 1);
		let dy = clamp(pointer.y - headNdc.y, -1, 1);
		dx = THREE.MathUtils.lerp(dx, clamp((monitorNdc.x - headNdc.x) * 2.5, -1, 1), mon);
		dy = THREE.MathUtils.lerp(dy, clamp((monitorNdc.y - headNdc.y) * 2.5, -1, 1), mon);
		const near = Math.hypot(pointer.x - headNdc.x, (pointer.y - headNdc.y) * 0.8) < 0.35 ? 1 : 0;

		smooth.headX = damp(smooth.headX, dx, 4, dt);
		smooth.headY = damp(smooth.headY, dy, 4, dt);
		smooth.eyeX = damp(smooth.eyeX, dx, 12, dt);
		smooth.eyeY = damp(smooth.eyeY, dy, 12, dt);
		smooth.brow = damp(smooth.brow, near, 6, dt);

		head.rotation.y = smooth.headX * 0.38;
		head.rotation.x = -smooth.headY * 0.22;
		head.rotation.z = -smooth.headX * 0.04;
		torsoGroup.rotation.y = smooth.headX * 0.1;

		for (const eye of eyeRig) {
			eye.look.rotation.y = smooth.eyeX * 0.5;
			eye.look.rotation.x = -smooth.eyeY * 0.38;
		}

		for (const brow of brows) {
			brow.position.y = brow.userData.baseY + smooth.brow * 0.045;
		}

		// blink
		if (t > nextBlink && blinkStart < 0) blinkStart = t;
		let lid = 1;
		if (blinkStart >= 0) {
			const p = (t - blinkStart) / BLINK_TIME;
			if (p >= 1) {
				blinkStart = -1;
				nextBlink = t + 2.5 + Math.random() * 3.5;
			} else {
				lid = 1 - Math.sin(p * Math.PI) * 0.92;
			}
		}
		for (const eye of eyeRig) eye.group.scale.y = lid;

		if (!reduceMotion) {
			const breath = Math.sin(t * 1.5);
			character.position.y = breath * 0.012;
			torsoGroup.scale.set(1 + breath * 0.004, 1 + breath * 0.006, 1);
		}
	}

	if (!reduceMotion) {
		dust.rotation.y = t * 0.012;
		dust.position.x = damp(dust.position.x, -pointer.x * 0.25, 2, dt);
		dust.position.y = damp(dust.position.y, -pointer.y * 0.15, 2, dt);
	}

	// orb cursor
	orbPos.x = damp(orbPos.x, orbTarget.x, 14, dt);
	orbPos.y = damp(orbPos.y, orbTarget.y, 14, dt);
	orb.style.transform = `translate(${orbPos.x}px, ${orbPos.y}px)`;

	renderer.render(scene, camera);
	requestAnimationFrame(frame);
}

canvas.classList.add("ready");
frame();
