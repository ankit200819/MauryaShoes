// Three.js and GSAP ScrollTrigger logic for real 3D shoe

let scene, camera, renderer, shoeModel;
const canvas = document.getElementById('shoe-canvas');

function init() {
  // 1. Scene setup
  scene = new THREE.Scene();
  // Transparent background
  
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 10);

  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;

  // 2. Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);

  const backLight = new THREE.DirectionalLight(0xaabbff, 0.8);
  backLight.position.set(-5, 5, -5);
  scene.add(backLight);

  // 3. Load Model
  const loader = new THREE.GLTFLoader();
  
  // Show a loading text or handle it silently
  loader.load('assets/shoe.glb', (gltf) => {
    shoeModel = gltf.scene;
    
    // Center and scale the model
    const box = new THREE.Box3().setFromObject(shoeModel);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    
    // Scale normalized to 3 units
    const scale = 5 / maxDim;
    shoeModel.scale.set(scale, scale, scale);
    
    // Center model at origin
    shoeModel.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

    // Create a wrapper group for easier positioning
    const wrapper = new THREE.Group();
    wrapper.add(shoeModel);
    
    // Initial state matching Hero section
    wrapper.position.set(2, 0, 0); // Right side
    wrapper.rotation.set(0.1, -0.6, 0.1); 
    scene.add(wrapper);

    // Constant rotation animation
    gsap.to(wrapper.rotation, {
      y: "+=0.3",
      x: "-=0.1",
      duration: 3,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });
    
    gsap.to(wrapper.position, {
      y: "+=0.2",
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });

    // 4. Scroll Animations setup!
    setupScrollAnimations(wrapper);

  }, undefined, (error) => {
    console.error('An error happened loading the 3D shoe:', error);
  });

  // Handle Resize
  window.addEventListener('resize', onWindowResize);
  
  // Render loop
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
}

function setupScrollAnimations(model) {
  gsap.registerPlugin(ScrollTrigger);

  const isMobile = window.innerWidth < 768;

  // 1. Move to Features Section (down and to the left)
  gsap.to(model.position, {
    scrollTrigger: {
      trigger: "#features-section",
      start: "top bottom",
      end: "center center",
      scrub: 1
    },
    x: isMobile ? 0 : -2.5,
    y: isMobile ? 2 : 0,
    ease: "power1.inOut"
  });

  gsap.to(model.rotation, {
    scrollTrigger: {
      trigger: "#features-section",
      start: "top bottom",
      end: "center center",
      scrub: 1
    },
    y: Math.PI + 0.5,
    x: 0.2,
    ease: "power1.inOut"
  });

  // 2. Move to Featured Products/Categories (down and side again)
  gsap.to(model.position, {
    scrollTrigger: {
      trigger: ".categories-section",
      start: "top bottom",
      end: "center center",
      scrub: 1
    },
    x: isMobile ? 0 : 2.5,
    y: -1,
    ease: "power1.inOut"
  });

  gsap.to(model.rotation, {
    scrollTrigger: {
      trigger: ".categories-section",
      start: "top bottom",
      end: "center center",
      scrub: 1
    },
    y: Math.PI * 2,
    z: -0.2,
    ease: "power1.inOut"
  });
  
  // 3. Move to Testimonials (center)
  gsap.to(model.position, {
    scrollTrigger: {
      trigger: ".products-section", // "Cart/cards section"
      start: "top bottom",
      end: "bottom center",
      scrub: 1
    },
    x: isMobile ? 0 : -2,
    y: 1,
    ease: "power1.inOut"
  });

  gsap.to(model.rotation, {
    scrollTrigger: {
      trigger: ".products-section",
      start: "top bottom",
      end: "bottom center",
      scrub: 1
    },
    y: Math.PI * 2.5,
    x: -0.3,
    ease: "power1.inOut"
  });
}

function onWindowResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

document.addEventListener('DOMContentLoaded', init);
