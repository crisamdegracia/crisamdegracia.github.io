import * as THREE from "three";
import * as CANNON from "cannon-es";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/*
 * "My techstack": glossy spheres with the tool logos fall into the section and
 * bounce around; moving the pointer through them shoves them. Own canvas + renderer,
 * and it only simulates / renders while the section is on screen.
 */

const canvas = document.getElementById("stackCanvas");
const section = canvas && canvas.closest(".stack");

// AI first: the spheres drop in this order, so the AI tools land at the bottom of the pile.
// Same list as the Auriros "Tools we work with" strip, plus the web stack.
const TECH = [
	{ name: "Claude", svg: "si-claude.svg", bg: "#ffffff", fg: "#D97757" },
	{ name: "Gemini", svg: "si-googlegemini.svg", bg: "#ffffff", fg: "#8E75B2" },
	{ name: "n8n", svg: "si-n8n.svg", bg: "#ffffff", fg: "#EA4B71" },
	{ name: "Postgres", svg: "si-postgresql.svg", bg: "#ffffff", fg: "#4169E1" },
	{ name: "Node.js", svg: "si-nodedotjs.svg", bg: "#ffffff", fg: "#5FA04E" },
	{ name: "WordPress", svg: "bw-wordpress.svg", bg: "#ffffff", fg: "#21759B" },
	{ name: "Elementor", svg: "bw-elementor.svg", bg: "#ffffff", fg: "#92003B" },
	{ name: "Astro", svg: "si-astro.svg", bg: "#ffffff", fg: "#BC52EE" },
	{ name: "HTML", svg: "bw-html5.svg", bg: "#ffffff", fg: "#E34F26" },
	{ name: "CSS", svg: "bw-css.svg", bg: "#ffffff", fg: "#1572B6" },
	{ name: "JavaScript", svg: "bw-javascript.svg", bg: "#F7DF1E", fg: "#111111" },
	{ name: "PHP", svg: "bw-php.svg", bg: "#ffffff", fg: "#777BB4" },
	{ name: "Cloudflare", svg: "si-cloudflare.svg", bg: "#ffffff", fg: "#F38020" },
	{ name: "Search Console", svg: "si-googlesearchconsole.svg", bg: "#ffffff", fg: "#458CF5" },
	{ name: "Tag Manager", svg: "si-googletagmanager.svg", bg: "#ffffff", fg: "#246FDB" },
	{ name: "Analytics", svg: "si-googleanalytics.svg", bg: "#ffffff", fg: "#E37400" },
	{ name: "Semrush", svg: "bw-semrush.svg", bg: "#ffffff", fg: "#FF642D" },
	{ name: "GitHub", svg: "bw-github.svg", bg: "#ffffff", fg: "#181717" },
];

if (canvas && section) init();

function init() {
	const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.matchMedia("(pointer: coarse)").matches ? 1.5 : 2));
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.05;

	const scene = new THREE.Scene();
	scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;

	const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
	const CAM_Z = 16;
	camera.position.set(0, 0, CAM_Z);

	const key = new THREE.DirectionalLight(0xffffff, 1.6);
	key.position.set(-3, 5, 8);
	scene.add(key);
	const rimL = new THREE.PointLight(0x8b5cf6, 120, 30, 2);
	rimL.position.set(-8, 3, -3);
	scene.add(rimL);
	const rimR = new THREE.PointLight(0x6d4aff, 90, 30, 2);
	rimR.position.set(8, -2, -3);
	scene.add(rimR);

	/* ---------- physics ---------- */
	const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -24, 0) });
	world.allowSleep = true;
	const ballMat = new CANNON.Material("ball");
	world.defaultContactMaterial = new CANNON.ContactMaterial(ballMat, ballMat, { friction: 0.15, restitution: 0.4 });

	let walls = [];
	const bounds = { w: 10, h: 8 };

	function buildWalls() {
		for (const wall of walls) world.removeBody(wall);
		walls = [];
		const depth = 0.95;
		const add = (x, y, z, rx, ry) => {
			const body = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: ballMat });
			body.position.set(x, y, z);
			body.quaternion.setFromEuler(rx, ry, 0);
			world.addBody(body);
			walls.push(body);
		};
		add(0, -bounds.h / 2 + 0.2, 0, -Math.PI / 2, 0); // floor
		add(-bounds.w / 2, 0, 0, 0, Math.PI / 2); // left
		add(bounds.w / 2, 0, 0, 0, -Math.PI / 2); // right
		add(0, 0, -depth, 0, 0); // back
		add(0, 0, depth, 0, Math.PI); // front
	}

	/* ---------- textures ---------- */
	async function makeTexture(item) {
		const c = document.createElement("canvas");
		c.width = 1024;
		c.height = 512;
		const g = c.getContext("2d");
		g.fillStyle = item.bg;
		g.fillRect(0, 0, c.width, c.height);

		let drawn = false;
		try {
			const res = await fetch(`/assets/images/${item.svg}`);
			if (!res.ok) throw new Error(res.statusText);
			let svg = await res.text();
			svg = svg.replace("<svg ", `<svg width="256" height="256" fill="${item.fg}" `);
			const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
			const img = new Image();
			await new Promise((ok, fail) => { img.onload = ok; img.onerror = fail; img.src = url; });
			for (const cx of [256, 768]) g.drawImage(img, cx - 120, 256 - 120, 240, 240);
			URL.revokeObjectURL(url);
			drawn = true;
		} catch (err) {
			/* fall back to text */
		}
		if (!drawn) {
			g.fillStyle = item.fg;
			g.font = "700 64px Inter, sans-serif";
			g.textAlign = "center";
			g.textBaseline = "middle";
			for (const cx of [256, 768]) g.fillText(item.name, cx, 256);
		}

		const tex = new THREE.CanvasTexture(c);
		tex.colorSpace = THREE.SRGBColorSpace;
		tex.anisotropy = 4;
		return tex;
	}

	const sphereGeo = new THREE.SphereGeometry(1, 48, 32);
	const balls = []; // { mesh, body }
	let textures = null;
	let spawned = false;

	function ballRadius() {
		return THREE.MathUtils.clamp(bounds.w * 0.042, 0.5, 0.9);
	}

	async function spawn() {
		if (spawned) return;
		spawned = true;
		textures = await Promise.all(TECH.map(makeTexture));
		const base = ballRadius();
		TECH.forEach((item, i) => {
			const r = base * (0.85 + Math.random() * 0.3);
			const mesh = new THREE.Mesh(
				sphereGeo,
				new THREE.MeshPhysicalMaterial({
					map: textures[i], roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 1,
				})
			);
			mesh.scale.setScalar(r);
			scene.add(mesh);

			const body = new CANNON.Body({
				mass: r * r * r,
				shape: new CANNON.Sphere(r),
				material: ballMat,
				linearDamping: 0.05,
				angularDamping: 0.25,
				sleepSpeedLimit: 0.2,
				sleepTimeLimit: 0.8,
			});
			const span = Math.max(bounds.w - 2 * r, 1);
			// stagger the drop so they rain in rather than land as a lump
			body.position.set((Math.random() - 0.5) * span, bounds.h / 2 + 1.5 + i * 1.1, (Math.random() - 0.5) * 0.5);
			body.quaternion.setFromEuler(Math.random() * 6, Math.random() * 6, Math.random() * 6);
			world.addBody(body);
			balls.push({ mesh, body, r });
		});
	}

	/* ---------- sizing ---------- */
	function resize() {
		const w = section.clientWidth;
		const h = section.clientHeight;
		if (!w || !h) return;
		renderer.setSize(w, h, false);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();

		bounds.h = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * CAM_Z;
		bounds.w = bounds.h * camera.aspect;
		buildWalls();

		for (const b of balls) {
			const lim = bounds.w / 2 - b.r;
			b.body.position.x = THREE.MathUtils.clamp(b.body.position.x, -lim, lim);
			b.body.wakeUp();
		}
	}
	new ResizeObserver(resize).observe(section);
	resize();

	/* ---------- pointer ---------- */
	const pointer = { x: 0, y: 0, active: 0 };
	section.addEventListener("pointermove", (e) => {
		const rect = section.getBoundingClientRect();
		pointer.x = ((e.clientX - rect.left) / rect.width - 0.5) * bounds.w;
		pointer.y = -((e.clientY - rect.top) / rect.height - 0.5) * bounds.h;
		pointer.active = performance.now();
	});

	/* ---------- loop ---------- */
	let running = false;
	let last = 0;

	function tick(now) {
		if (!running) return;
		const dt = Math.min((now - last) / 1000, 0.05);
		last = now;

		if (now - pointer.active < 90) {
			for (const b of balls) {
				const dx = b.body.position.x - pointer.x;
				const dy = b.body.position.y - pointer.y;
				const dist = Math.hypot(dx, dy) || 0.001;
				const reach = b.r + 1.2;
				if (dist < reach) {
					const push = (1 - dist / reach) * 7 * b.body.mass;
					b.body.wakeUp();
					b.body.applyImpulse(new CANNON.Vec3((dx / dist) * push, (dy / dist) * push + push * 0.3, 0));
				}
			}
		}

		world.step(1 / 60, dt, 3);
		for (const b of balls) {
			b.mesh.position.copy(b.body.position);
			b.mesh.quaternion.copy(b.body.quaternion);
		}
		renderer.render(scene, camera);
		requestAnimationFrame(tick);
	}

	new IntersectionObserver(
		([entry]) => {
			const visible = entry.isIntersecting;
			if (visible && !running) {
				running = true;
				last = performance.now();
				requestAnimationFrame(tick);
			} else if (!visible) {
				running = false;
			}
		},
		{ threshold: 0 }
	).observe(section);

	// start the rain a little before the section is fully in view
	new IntersectionObserver(
		([entry]) => { if (entry.isIntersecting) spawn(); },
		{ threshold: 0.3 }
	).observe(section);
}
