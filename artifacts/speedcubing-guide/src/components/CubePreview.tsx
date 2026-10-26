import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { CSS3DObject, CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';

type Props = { algorithm: string; caseName: string };

const colors = {
  plastic: '#202329', white: '#f4f1e9', yellow: '#f1cb38',
  green: '#398b62', blue: '#416da8', orange: '#e88642', red: '#cf4f46',
};
type RenderMode = 'webgl' | 'css3d';
type CubeRenderer = THREE.WebGLRenderer | CSS3DRenderer;
const WEBGL_SPACING = 1.02;
const CSS3D_STICKER_SIZE = 48;
const CSS3D_SPACING = 54;

const faceTransforms = {
  right: 'rotateY(90deg)',
  left: 'rotateY(-90deg)',
  top: 'rotateX(90deg)',
  bottom: 'rotateX(-90deg)',
  front: '',
  back: 'rotateY(180deg)',
} as const;

function faceColorMap(x: number, y: number, z: number) {
  return {
    right: x === 1 ? colors.red : colors.plastic,
    left: x === -1 ? colors.orange : colors.plastic,
    top: y === 1 ? colors.white : colors.plastic,
    bottom: y === -1 ? colors.yellow : colors.plastic,
    front: z === 1 ? colors.green : colors.plastic,
    back: z === -1 ? colors.blue : colors.plastic,
  };
}

function createCubies(root: THREE.Group, mode: RenderMode) {
  const geometry = mode === 'webgl' ? new THREE.BoxGeometry(.94, .94, .94) : null;
  const spacing = mode === 'webgl' ? WEBGL_SPACING : CSS3D_SPACING;
  const materials: THREE.Material[] = [];
  const pieces: THREE.Object3D[] = [];
  for (const x of [-1, 0, 1]) for (const y of [-1, 0, 1]) for (const z of [-1, 0, 1]) {
    const stickers = faceColorMap(x, y, z);
    let piece: THREE.Object3D;
    if (mode === 'webgl' && geometry) {
      const orderedColors = [stickers.right, stickers.left, stickers.top, stickers.bottom, stickers.front, stickers.back];
      const pieceMaterials = orderedColors.map((color) => {
        const material = new THREE.MeshStandardMaterial({ color, roughness: .38, metalness: .02 });
        materials.push(material);
        return material;
      });
      const mesh = new THREE.Mesh(geometry, pieceMaterials);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      piece = mesh;
    } else {
      const element = document.createElement('div');
      element.className = 'css-cubelet';
      element.setAttribute('aria-hidden', 'true');
      for (const [face, transform] of Object.entries(faceTransforms)) {
        const sticker = document.createElement('div');
        sticker.className = `css-cubelet-face ${face}`;
        sticker.style.backgroundColor = stickers[face as keyof typeof stickers];
        sticker.style.transform = `${transform}${transform ? ' ' : ''}translateZ(${CSS3D_STICKER_SIZE / 2}px)`;
        element.appendChild(sticker);
      }
      piece = new CSS3DObject(element);
    }
    piece.position.set(x * spacing, y * spacing, z * spacing);
    root.add(piece);
    pieces.push(piece);
  }
  return { pieces, geometry, materials };
}

function parseMove(token: string) {
  const wide = token.includes('w') || /^[rludfb]/.test(token);
  const face = token.replace(/w/g, '').replace(/[2']/g, '').toUpperCase();
  const axisMap: Record<string, 'x' | 'y' | 'z'> = { R: 'x', L: 'x', M: 'x', U: 'y', D: 'y', E: 'y', F: 'z', B: 'z', S: 'z', X: 'x', Y: 'y', Z: 'z' };
  const axis = axisMap[face] ?? 'x';
  const normal: Record<string, number> = { R: 1, L: -1, M: -1, U: 1, D: -1, E: -1, F: 1, B: -1, S: 1, X: 1, Y: 1, Z: 1 };
  let layers: number[];
  if (['x', 'y', 'z'].includes(face.toLowerCase())) layers = [-1, 0, 1];
  else if (face === 'M' || face === 'E' || face === 'S') layers = [0];
  else {
    const layer = normal[face] ?? 1;
    layers = wide ? [0, layer] : [layer];
  }
  const prime = token.includes("'");
  const double = token.includes('2');
  const angle = (prime ? 1 : -1) * (normal[face] ?? 1) * (double ? Math.PI : Math.PI / 2);
  return { axis, layers, angle };
}

function roundAngle(value: number) {
  return Math.round(value / (Math.PI / 2)) * (Math.PI / 2);
}

function invertMove(token: string) {
  if (token.includes('2')) return token;
  return token.includes("'") ? token.replace("'", '') : `${token}'`;
}

export function CubePreview({ algorithm, caseName }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<CubeRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rootRef = useRef<THREE.Group | null>(null);
  const piecesRef = useRef<THREE.Object3D[]>([]);
  const renderModeRef = useRef<RenderMode>('webgl');
  const unitRef = useRef(WEBGL_SPACING);
  const resourcesRef = useRef<{ geometry: THREE.BufferGeometry | null; materials: THREE.Material[] }>({ geometry: null, materials: [] });
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [ready, setReady] = useState(false);
  const [renderMode, setRenderMode] = useState<RenderMode>('webgl');
  const [rendererError, setRendererError] = useState('');
  const speedRef = useRef(speed);
  const stepRef = useRef(step);
  const playingRef = useRef(playing);
  const algorithmRef = useRef<string | null>(null);
  speedRef.current = speed;
  stepRef.current = step;
  playingRef.current = playing;
  const moves = useMemo(() => algorithm.trim().split(/\s+/).filter(Boolean), [algorithm]);
  const setupMoves = useMemo(() => moves.slice().reverse().map(invertMove), [moves]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#e9e4d8');
    const camera = new THREE.PerspectiveCamera(34, 1, .1, 10000);
    camera.lookAt(0, 0, 0);
    let mode: RenderMode = 'webgl';
    let renderer: CubeRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    } catch {
      // Some hosted previews disable WebGL. CSS3DRenderer keeps the same
      // Three.js scene graph and layer-turn engine, without requesting a context.
      try {
        mode = 'css3d';
        renderer = new CSS3DRenderer();
        renderModeRef.current = mode;
        setRenderMode(mode);
      } catch {
        setRendererError('The 3D cube could not be initialized in this browser.');
        return;
      }
    }
    renderModeRef.current = mode;
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.domElement.className = 'cube-canvas';
    renderer.domElement.setAttribute('aria-label', 'Interactive 3D Rubik’s cube. Drag to rotate the view.');
    mount.appendChild(renderer.domElement);
    if (mode === 'webgl') {
      scene.add(new THREE.HemisphereLight('#fff9ed', '#6e766d', 2.2));
      const key = new THREE.DirectionalLight('#ffffff', 2.7);
      key.position.set(5, 8, 7);
      key.castShadow = true;
      scene.add(key);
      const fill = new THREE.DirectionalLight('#d4e4e0', 1.1);
      fill.position.set(-5, 2, -5);
      scene.add(fill);
    }
    const root = new THREE.Group();
    root.rotation.set(-.18, -.34, 0);
    scene.add(root);
    unitRef.current = mode === 'webgl' ? WEBGL_SPACING : CSS3D_SPACING;
    const initialCube = createCubies(root, mode);
    piecesRef.current = initialCube.pieces;
    resourcesRef.current = { geometry: initialCube.geometry, materials: initialCube.materials };
    const fitCamera = () => {
      if (mode === 'css3d') {
        // CSS3DRenderer measures transforms in CSS pixels, so use pixel-sized
        // cubies and a correspondingly scaled camera rather than tiny GL units.
        camera.position.set(5.8 * CSS3D_SPACING, 5.2 * CSS3D_SPACING, 7.3 * CSS3D_SPACING);
        camera.lookAt(0, 0, 0);
      } else {
        camera.position.set(5.8, 5.2, 7.3);
        camera.lookAt(0, 0, 0);
      }
      camera.aspect = mount.clientWidth / Math.max(mount.clientHeight, 1);
      camera.updateProjectionMatrix();
    };
    fitCamera();
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    rootRef.current = root;
    setReady(true);
    const resize = new ResizeObserver(() => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      fitCamera();
    });
    resize.observe(mount);
    let animationFrame = 0;
    const render = () => {
      animationFrame = requestAnimationFrame(render);
      renderer.render(scene, camera);
    };
    render();
    let pointerId: number | null = null;
    let lastX = 0;
    let lastY = 0;
    const onDown = (event: PointerEvent) => {
      pointerId = event.pointerId;
      lastX = event.clientX;
      lastY = event.clientY;
      renderer.domElement.setPointerCapture(pointerId);
    };
    const onMove = (event: PointerEvent) => {
      if (pointerId !== event.pointerId) return;
      root.rotation.y += (event.clientX - lastX) * .009;
      root.rotation.x += (event.clientY - lastY) * .009;
      lastX = event.clientX;
      lastY = event.clientY;
    };
    const onUp = (event: PointerEvent) => {
      if (pointerId === event.pointerId) pointerId = null;
    };
    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointermove', onMove);
    renderer.domElement.addEventListener('pointerup', onUp);
    renderer.domElement.addEventListener('pointercancel', onUp);
    return () => {
      cancelAnimationFrame(animationFrame);
      resize.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('pointerup', onUp);
      renderer.domElement.removeEventListener('pointercancel', onUp);
      if (renderer instanceof THREE.WebGLRenderer) renderer.dispose();
      resourcesRef.current.geometry?.dispose();
      resourcesRef.current.materials.forEach((material) => material.dispose());
      mount.removeChild(renderer.domElement);
      setReady(false);
    };
  }, []);

  const resetCube = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    if (renderModeRef.current === 'css3d') {
      piecesRef.current.forEach((piece) => {
        if (piece instanceof CSS3DObject) piece.element.remove();
      });
    }
    resourcesRef.current.geometry?.dispose();
    resourcesRef.current.materials.forEach((material) => material.dispose());
    root.clear();
    unitRef.current = renderModeRef.current === 'webgl' ? WEBGL_SPACING : CSS3D_SPACING;
    const cube = createCubies(root, renderModeRef.current);
    piecesRef.current = cube.pieces;
    resourcesRef.current = { geometry: cube.geometry, materials: cube.materials };
  }, []);

  const turn = useCallback((token: string, duration = 260) => new Promise<void>((resolve) => {
    const root = rootRef.current;
    if (!root) { resolve(); return; }
    const parsed = parseMove(token);
    const axisIndex = parsed.axis === 'x' ? 0 : parsed.axis === 'y' ? 1 : 2;
    const unit = unitRef.current;
    const pivot = new THREE.Group();
    root.add(pivot);
    const selected = piecesRef.current.filter((piece) => parsed.layers.some((layer) => Math.abs(piece.position.getComponent(axisIndex) - layer * unit) < unit * .3));
    selected.forEach((piece) => pivot.attach(piece));
    const axis = new THREE.Vector3(parsed.axis === 'x' ? 1 : 0, parsed.axis === 'y' ? 1 : 0, parsed.axis === 'z' ? 1 : 0);
    const settle = () => {
      [...pivot.children].forEach((piece) => {
        root.attach(piece);
        piece.position.set(
          Math.round(piece.position.x / unit) * unit,
          Math.round(piece.position.y / unit) * unit,
          Math.round(piece.position.z / unit) * unit,
        );
        const euler = new THREE.Euler().setFromQuaternion(piece.quaternion);
        piece.quaternion.setFromEuler(new THREE.Euler(roundAngle(euler.x), roundAngle(euler.y), roundAngle(euler.z)));
      });
      root.remove(pivot);
      resolve();
    };
    if (duration <= 0) {
      pivot.setRotationFromAxisAngle(axis, parsed.angle);
      settle();
      return;
    }
    const start = performance.now();
    const total = duration / speedRef.current;
    const animate = (now: number) => {
      const progress = Math.min(1, (now - start) / total);
      const eased = 1 - Math.pow(1 - progress, 3);
      pivot.setRotationFromAxisAngle(axis, parsed.angle * eased);
      if (progress < 1) requestAnimationFrame(animate);
      else settle();
    };
    requestAnimationFrame(animate);
  }), []);

  const prepareCase = useCallback(async () => {
    resetCube();
    setStep(0);
    for (const move of setupMoves) await turn(move, 0);
  }, [resetCube, setupMoves, turn]);

  useEffect(() => {
    if (!ready) return;
    if (algorithmRef.current === algorithm) return;
    algorithmRef.current = algorithm;
    setPlaying(false);
    void prepareCase();
  }, [algorithm, ready, prepareCase]);

  const stepForward = useCallback(async () => {
    const current = stepRef.current;
    if (current >= moves.length) return;
    await turn(moves[current]);
    setStep(current + 1);
  }, [moves, turn]);
  const stepBack = useCallback(async () => {
    const target = Math.max(0, stepRef.current - 1);
    setPlaying(false);
    await prepareCase();
    for (let i = 0; i < target; i++) {
      await turn(moves[i], 70);
      setStep(i + 1);
    }
  }, [moves, prepareCase, turn]);
  const reset = useCallback(() => {
    setPlaying(false);
    void prepareCase();
  }, [prepareCase]);

  useEffect(() => {
    if (!playing) return;
    let cancelled = false;
    const run = async () => {
      while (!cancelled && playingRef.current && stepRef.current < moves.length) {
        await stepForward();
      }
      if (!cancelled) setPlaying(false);
    };
    void run();
    return () => { cancelled = true; };
  }, [playing, moves.length, stepForward]);

  const currentMove = step > 0 ? moves[step - 1] : 'Ready';
  return (
    <section className="cube-panel" aria-label="Interactive algorithm preview">
      <div className="cube-stage">
        <div className="cube-canvas-mount" ref={mountRef} data-testid="cube-preview" />
        {rendererError && <div className="cube-renderer-error" role="status" data-testid="cube-renderer-error">{rendererError}</div>}
        <div className="cube-stage-label">
          <span className="eyebrow">LIVE CUBE LAB{renderMode === 'css3d' ? ' · CSS 3D FALLBACK' : ''}</span>
          <span className="cube-drag-tip">Drag to orbit</span>
        </div>
        <div className="cube-step-pill" data-testid="cube-step-status"><span>{String(step).padStart(2, '0')}</span><i>/</i>{String(moves.length).padStart(2, '0')}</div>
      </div>
      <div className="cube-controls">
        <div className="cube-control-head">
          <div><span className="eyebrow">ACTIVE LESSON</span><strong data-testid="cube-case-name">{caseName}</strong></div>
          <div className="current-move"><span className="eyebrow">CURRENT MOVE</span><strong className="algorithm" data-testid="cube-current-move">{currentMove}</strong></div>
        </div>
        <div className="cube-case-setup" data-testid="cube-case-setup">
          <div className="cube-case-setup-heading"><span className="eyebrow">GENERATED CASE SETUP</span><span>{setupMoves.length} moves</span></div>
          <code className="algorithm" data-testid="cube-case-setup-algorithm">{setupMoves.join(' ') || 'Solved state'}</code>
          <p>Apply this setup from solved; the selected algorithm solves the previewed case.</p>
        </div>
        <div className="move-track" aria-label={`Algorithm progress, ${step} of ${moves.length} moves`}>
          {moves.map((move, index) => <button type="button" key={`${index}-${move}`} onClick={async () => {
            setPlaying(false);
            if (index < stepRef.current) {
              await prepareCase();
              for (let i = 0; i <= index; i++) { await turn(moves[i], 100); setStep(i + 1); }
            } else {
              for (let i = stepRef.current; i <= index; i++) { await turn(moves[i]); setStep(i + 1); }
            }
          }} disabled={algorithmRef.current !== algorithm} aria-label={`Jump to move ${index + 1}: ${move}`} data-testid={`cube-move-${index}`} className={index < step ? 'done' : index === step ? 'next' : ''}>{move}</button>)}
        </div>
        <div className="cube-control-row">
          <div className="transport">
            <button type="button" onClick={stepBack} disabled={algorithmRef.current !== algorithm} aria-label="Step backward" data-testid="cube-step-back"><ChevronLeft size={17} /></button>
            <button type="button" onClick={() => setPlaying(!playing)} disabled={algorithmRef.current !== algorithm} className="play-button" aria-label={playing ? 'Pause algorithm' : 'Play algorithm'} data-testid="cube-play">{playing ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}</button>
            <button type="button" onClick={stepForward} disabled={algorithmRef.current !== algorithm} aria-label="Step forward" data-testid="cube-step-forward"><ChevronRight size={17} /></button>
            <button type="button" onClick={reset} aria-label="Reset cube" data-testid="cube-reset"><RotateCcw size={15} /></button>
          </div>
          <label className="speed-control"><span className="eyebrow">SPEED</span><select value={speed} onChange={(event) => setSpeed(Number(event.target.value))} aria-label="Animation speed" data-testid="cube-speed"><option value={0.6}>0.6×</option><option value={1}>1×</option><option value={1.5}>1.5×</option></select></label>
        </div>
      </div>
    </section>
  );
}
