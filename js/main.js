import { view } from "./character.js";
import "./techstack.js";

/*
 * Scroll choreography. Everything here is progressive enhancement: the content is
 * plain HTML, so if GSAP (or any CDN script) fails to load the page still reads fine.
 */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const narrow = window.matchMedia("(max-width: 800px)");
const { gsap, ScrollTrigger, Lenis } = window;

/* ---------- footer year ---------- */
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

/* ---------- project thumbnails: a colour spotlight follows the cursor ---------- */
// Each screenshot is shown as a purple duotone; a second, full-colour copy sits on top and is
// masked (in CSS) to a soft circle at the pointer position.
if (window.matchMedia("(hover: hover)").matches) {
	document.querySelectorAll(".card-media:not(.card-media--diagram)").forEach((media) => {
		const base = media.querySelector("img");
		if (!base) return;
		const color = base.cloneNode();
		color.classList.add("reveal");
		color.alt = "";
		color.setAttribute("aria-hidden", "true");
		media.append(color);

		media.addEventListener("pointermove", (e) => {
			const r = media.getBoundingClientRect();
			media.style.setProperty("--mx", e.clientX - r.left + "px");
			media.style.setProperty("--my", e.clientY - r.top + "px");
		});
	});
}

/* ---------- contact form ---------- */
// Delivered by Formsubmit (no backend on GitHub Pages). The first ever submission makes
// Formsubmit email crisamdegracia@gmail.com an activation link; confirm it once and it works.
const contactForm = document.getElementById("contactForm");
if (contactForm) {
	const ENDPOINT = "https://formsubmit.co/ajax/crisamdegracia@gmail.com";
	const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const status = contactForm.querySelector(".form-status");
	const submit = contactForm.querySelector('button[type="submit"]');
	const say = (text, kind = "") => { status.textContent = text; status.dataset.kind = kind; };

	contactForm.addEventListener("submit", async (e) => {
		e.preventDefault();
		const data = Object.fromEntries(new FormData(contactForm));
		if (data._honey) return say("Thanks!", "ok"); // hidden field filled in: a bot, pretend it worked

		const name = String(data.name || "").trim();
		const email = String(data.email || "").trim();
		const message = String(data.message || "").trim();
		const topic = String(data.topic || "");
		if (!name || !message || !EMAIL_RE.test(email)) {
			return say("Please add your name, a valid email and a message.", "error");
		}

		submit.disabled = true;
		say("Sending...");
		try {
			const res = await fetch(ENDPOINT, {
				method: "POST",
				headers: { "Content-Type": "application/json", Accept: "application/json" },
				body: JSON.stringify({
					name, email, topic, message,
					_subject: `Portfolio inquiry: ${topic} (${name})`,
					_template: "table",
					_captcha: "false",
				}),
			});
			const out = await res.json().catch(() => ({}));
			if (!res.ok || String(out.success) === "false") throw new Error(out.message || res.status);

			contactForm.reset();
			say("Thanks! I'll reply soon.", "ok");
			// same event name Auriros uses; no personal data in the dataLayer
			window.dataLayer = window.dataLayer || [];
			window.dataLayer.push({ event: "generate_lead", form_id: "portfolio_contact", topic });
		} catch (err) {
			say("Couldn't send that. Please email me at crisamdegracia@gmail.com instead.", "error");
		} finally {
			submit.disabled = false;
		}
	});
}

/* ---------- tools marquee: duplicate the list so the CSS loop is seamless ---------- */
const marqueeTrack = document.querySelector(".marquee-track");
if (marqueeTrack && !reduceMotion) {
	const copy = marqueeTrack.firstElementChild.cloneNode(true);
	copy.setAttribute("aria-hidden", "true");
	marqueeTrack.append(copy);
}

/* ---------- "what I do" accordion (works without GSAP) ---------- */
document.querySelectorAll(".skill").forEach((item) => {
	const btn = item.querySelector("button");
	btn.addEventListener("click", () => {
		document.querySelectorAll(".skill").forEach((other) => {
			const open = other === item;
			other.classList.toggle("open", open);
			other.querySelector("button").setAttribute("aria-expanded", String(open));
		});
	});
});

if (gsap && ScrollTrigger) {
	gsap.registerPlugin(ScrollTrigger);

	/* ---------- smooth scroll ---------- */
	let lenis = null;
	if (Lenis && !reduceMotion) {
		lenis = new Lenis({ lerp: 0.1 });		lenis.on("scroll", ScrollTrigger.update);
		gsap.ticker.add((time) => lenis.raf(time * 1000));
		gsap.ticker.lagSmoothing(0);
	}

	document.querySelectorAll('a[href^="#"]').forEach((a) => {
		a.addEventListener("click", (e) => {
			const id = a.getAttribute("href");
			const target = id.length > 1 ? document.querySelector(id) : null;
			if (!target) return;
			e.preventDefault();
			if (lenis) lenis.scrollTo(target, { offset: 0 });
			else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
		});
	});

	/* ---------- character states per section ---------- */
	const STATES = {
		hero: { x: -0.25, y: 0, scale: 1, rotY: 0, vis: 1, monitor: 0 },
		about: { x: -0.26, y: 0, scale: 0.95, rotY: 0.35, vis: 1, monitor: 0 },
		what: { x: -0.32, y: -0.15, scale: 0.8, rotY: 0.2, vis: 1, monitor: 1 },
		career: { x: -0.75, y: -0.15, scale: 0.8, rotY: 0.6, vis: 0, monitor: 0 },
	};

	// on phones the text sits under the character, so it only stays for the hero
	function stateFor(name) {
		const s = { ...STATES[name] };
		if (narrow.matches) {
			s.scale *= 0.8;
			if (name !== "hero") s.vis = 0;
		}
		return s;
	}

	function goTo(name) {
		const s = stateFor(name);
		if (reduceMotion) { Object.assign(view, s); return; }
		gsap.to(view, { ...s, duration: 1.3, ease: "power3.inOut", overwrite: true });
	}

	Object.keys(STATES).forEach((name) => {
		ScrollTrigger.create({
			trigger: `#${name}`,
			start: "top 55%",
			// "career" stays active to the end of the page, so a jump straight past it
			// (End key, nav link, scroll restore) still hides the character
			end: name === "career" ? "max" : "bottom 55%",
			onToggle: (self) => { if (self.isActive) goTo(name); },
		});
	});

	// intro
	if (!reduceMotion) {
		gsap.from(view, { vis: 0, scale: 0.8, duration: 1.6, ease: "power3.out", delay: 0.2 });
		gsap.from(".hero-copy > *", { y: 30, opacity: 0, duration: 1, stagger: 0.12, delay: 0.5, ease: "power3.out" });
	}

	/* ---------- nav highlight ---------- */
	const links = document.querySelectorAll(".nav nav a");
	["about", "work", "contact"].forEach((id) => {
		ScrollTrigger.create({
			trigger: `#${id}`,
			// the Work link stays lit through the SEO & automation grid too
			endTrigger: id === "work" ? "#more" : `#${id}`,
			start: "top 50%",
			end: "bottom 50%",
			onToggle: (self) => {
				links.forEach((l) => l.classList.toggle("active", self.isActive && l.getAttribute("href") === `#${id}`));
			},
		});
	});

	/* ---------- reveal on scroll ---------- */
	if (!reduceMotion) {
		gsap.utils.toArray("[data-reveal]").forEach((el) => {
			gsap.from(el, {
				y: 40,
				opacity: 0,
				duration: 0.9,
				ease: "power3.out",
				scrollTrigger: { trigger: el, start: "top 85%", once: true },
			});
		});
	}

	/* ---------- career timeline ---------- */
	const fill = document.querySelector(".tl-line-fill");
	if (fill && !reduceMotion) {
		gsap.fromTo(
			fill,
			{ scaleY: 0 },
			{
				scaleY: 1,
				ease: "none",
				scrollTrigger: { trigger: ".timeline", start: "top 65%", end: "bottom 60%", scrub: true },
			}
		);
		gsap.utils.toArray(".tl-item").forEach((item) => {
			gsap.from(item.children, {
				y: 36,
				opacity: 0,
				duration: 0.8,
				stagger: 0.1,
				ease: "power3.out",
				scrollTrigger: { trigger: item, start: "top 80%", once: true },
			});
		});
	}

	/* ---------- work: vertical scroll drives a horizontal slide ---------- */
	const work = document.getElementById("work");
	const track = document.querySelector(".work-track");
	const bar = document.querySelector(".work-progress i");

	if (work && track) {
		if (reduceMotion) {
			work.classList.add("native-scroll");
		} else {
			const mm = gsap.matchMedia();
			// desktop: vertical scroll drives the horizontal slide
			mm.add("(min-width: 801px)", () => {
				const distance = () => Math.max(track.scrollWidth - window.innerWidth, 0);
				gsap.to(track, {
					x: () => -distance(),
					ease: "none",
					scrollTrigger: {
						trigger: work,
						start: "top top",
						end: () => "+=" + distance(),
						pin: true,
						scrub: 0.6,
						anticipatePin: 1,
						invalidateOnRefresh: true,
						onUpdate: (self) => { if (bar) bar.style.transform = `scaleX(${self.progress})`; },
					},
				});
			});
			// phones: a pinned slide fights thumb scrolling, so the row just swipes natively
			mm.add("(max-width: 800px)", () => {
				work.classList.add("native-scroll");
				return () => work.classList.remove("native-scroll");
			});
		}
	}

	// layout shifts when fonts / images arrive
	window.addEventListener("load", () => ScrollTrigger.refresh());
	narrow.addEventListener("change", () => ScrollTrigger.refresh());
}
