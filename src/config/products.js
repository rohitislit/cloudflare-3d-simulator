export const SCENE_LAYOUT = {
  coreApp: [0, 0.34, 0],
  workers: [-3.05, 0, -2.2],
  d1: [3.05, 0, -2.15],
  r2: [3.15, 0, 2.05],
  workersAI: [-3.15, 0, 2.05],
  aiGateway: [0, 0, 3.55],
  speculative: [0, 0, -3.55],
};

export const BASE_PLATFORM = {
  id: 'base-platform',
  label: 'Base Platform',
  productLabel: 'Foundation Layer',
  modelPath: '/models/BASEPLATFORM.glb',
  position: [0, 0, 0],
  scale: 1.92,
  rotation: [0, 0, 0],
  frameBox: [7.6, 1.3, 7.6],
  focusBox: [4.8, 1.6, 4.8],
  focusTarget: [0, 0.42, 0],
  focusPosition: [6.2, 4.2, 6.4],
  focusDirection: [1, 0.64, 1],
  focusDistance: 8.4,
  focusZoom: 92,
  labelOffset: [0, 1.25, 0],
  title: 'Base Platform',
  whatItDoes:
    'The shared base layer grounds the ecosystem and represents the Cloudflare foundation everything else is deployed on.',
  whatItCouldUnlock:
    'A stable operational surface for edge compute, storage, routing, AI services, and future product modules to connect cleanly.',
};

export const CORE_APP = {
  id: 'core-app',
  label: 'Core App',
  productLabel: 'Application Layer',
  modelPath: '/models/COREAPPBUIDING.glb',
  position: SCENE_LAYOUT.coreApp,
  scale: 1.24,
  rotation: [0, 0, 0],
  frameBox: [2.35, 3.4, 2.35],
  focusBox: [2.35, 3.5, 2.35],
  focusTarget: [0, 1.35, 0],
  focusPosition: [5.2, 4.8, 5.4],
  focusDirection: [1, 0.72, 1],
  focusDistance: 6.6,
  focusZoom: 108,
  labelOffset: [0, 3.2, 0],
  title: 'Core App',
  whatItDoes:
    'The central building represents the user application, anchored at the middle of the Cloudflare ecosystem.',
  whatItCouldUnlock:
    'As surrounding infrastructure grows, the core app can gain edge logic, storage, AI capabilities, observability, and future product paths.',
};

export const PRODUCT_CONFIG = [
  {
    id: 'workers',
    label: 'Workers',
    productLabel: 'Cloudflare Workers',
    modelPath: '/models/WORKERS.glb',
    position: SCENE_LAYOUT.workers,
    scale: 1.08,
    rotation: [0, 0, 0],
    frameBox: [2.1, 2.15, 2.1],
    focusBox: [1.8, 2, 1.8],
    focusTarget: [-3.05, 0.88, -2.2],
    focusPosition: [-7.7, 3.6, -6.9],
    focusDirection: [0.86, 0.56, 0.94],
    focusDistance: 5.8,
    focusZoom: 132,
    labelOffset: [0, 2.15, 0],
    title: 'Cloudflare Workers',
    whatItDoes:
      'Runs serverless code across Cloudflare’s global network with fast startup and automatic scaling.',
    whatItCouldUnlock:
      'Lightweight APIs, auth logic, automation, and backend features without managing servers.',
  },
  {
    id: 'd1',
    label: 'D1',
    productLabel: 'Cloudflare D1',
    modelPath: '/models/D1.glb',
    position: SCENE_LAYOUT.d1,
    scale: 1.06,
    rotation: [0, 0, 0],
    frameBox: [2.05, 2.1, 2.05],
    focusBox: [1.8, 1.95, 1.8],
    focusTarget: [3.05, 0.84, -2.15],
    focusPosition: [7.4, 3.5, -6.7],
    focusDirection: [-0.9, 0.58, 0.88],
    focusDistance: 5.8,
    focusZoom: 130,
    labelOffset: [0, 2.05, 0],
    title: 'Cloudflare D1',
    whatItDoes:
      'Serverless SQL storage for structured application data.',
    whatItCouldUnlock:
      'User accounts, app records, relational data, and recoverable operational storage.',
  },
  {
    id: 'r2',
    label: 'R2',
    productLabel: 'Cloudflare R2',
    modelPath: '/models/R2.glb',
    position: SCENE_LAYOUT.r2,
    scale: 1.08,
    rotation: [0, 0, 0],
    frameBox: [2.1, 2.15, 2.1],
    focusBox: [1.84, 2.05, 1.84],
    focusTarget: [3.15, 0.82, 2.05],
    focusPosition: [7.8, 3.4, 6.6],
    focusDirection: [-0.94, 0.54, -0.82],
    focusDistance: 5.9,
    focusZoom: 126,
    labelOffset: [0, 2.1, 0],
    title: 'Cloudflare R2',
    whatItDoes:
      'Object storage for large files and assets.',
    whatItCouldUnlock:
      'Uploads, documents, media libraries, exports, and other durable file storage.',
  },
  {
    id: 'workers-ai',
    label: 'Workers AI',
    productLabel: 'Cloudflare Workers AI',
    modelPath: '/models/WORKERSAI.glb',
    position: SCENE_LAYOUT.workersAI,
    scale: 1.08,
    rotation: [0, 0, 0],
    frameBox: [2.15, 2.15, 2.15],
    focusBox: [1.9, 2, 1.9],
    focusTarget: [-3.15, 0.82, 2.05],
    focusPosition: [-7.8, 3.4, 6.6],
    focusDirection: [0.92, 0.55, -0.84],
    focusDistance: 5.9,
    focusZoom: 126,
    labelOffset: [0, 2.1, 0],
    title: 'Workers AI',
    whatItDoes:
      'Runs AI inference on Cloudflare’s network.',
    whatItCouldUnlock:
      'Summarization, classification, assistants, content generation, and AI features inside the app.',
  },
  {
    id: 'ai-gateway',
    label: 'AI Gateway',
    productLabel: 'Cloudflare AI Gateway',
    modelPath: '/models/AIGATEWAY.glb',
    position: SCENE_LAYOUT.aiGateway,
    scale: 1.04,
    rotation: [0, 0, 0],
    frameBox: [1.95, 2.05, 1.95],
    focusBox: [1.7, 1.9, 1.7],
    focusTarget: [0, 0.8, 3.55],
    focusPosition: [0.2, 3.2, 8.9],
    focusDirection: [0.04, 0.62, -1],
    focusDistance: 5.5,
    focusZoom: 128,
    labelOffset: [0, 1.95, 0],
    title: 'AI Gateway',
    whatItDoes:
      'Observes, routes, and controls AI traffic.',
    whatItCouldUnlock:
      'Logging, caching, failover, usage visibility, and safer AI request management.',
  },
  {
    id: 'future-feature',
    label: 'Future Feature',
    productLabel: 'Future Capability',
    modelPath: '/models/SPECULATIVEMODEL.glb',
    position: SCENE_LAYOUT.speculative,
    scale: 1.02,
    rotation: [0, 0, 0],
    frameBox: [1.95, 2, 1.95],
    focusBox: [1.7, 1.9, 1.7],
    focusTarget: [0, 0.8, -3.55],
    focusPosition: [0.2, 3.2, -8.9],
    focusDirection: [0.05, 0.62, 1],
    focusDistance: 5.5,
    focusZoom: 128,
    labelOffset: [0, 1.9, 0],
    title: 'Future Capability',
    whatItDoes:
      'Represents a new feature unlocked by better infrastructure.',
    whatItCouldUnlock:
      'A speculative next step for the user’s product, such as automation, collaboration, AI workflows, or richer media features.',
  },
];

export const DEFAULT_INFO = {
  id: null,
  label: 'Shared Cloudflare Ecosystem',
  title: 'Shared Cloudflare Ecosystem',
  whatItDoes:
    'The central building represents your product running on a shared Cloudflare foundation while surrounding services are deployed into the same world.',
  whatItCouldUnlock:
    'Toggle modules to assemble the system, build the surrounding infrastructure, and see how the shared ecosystem grows around the core app.',
};

export const SCENE_ITEMS = [BASE_PLATFORM, CORE_APP, ...PRODUCT_CONFIG];

export const SCENE_ITEM_MAP = Object.fromEntries(
  SCENE_ITEMS.map((item) => [item.id, item]),
);

export const ALL_MODEL_PATHS = [
  BASE_PLATFORM.modelPath,
  CORE_APP.modelPath,
  ...PRODUCT_CONFIG.map((product) => product.modelPath),
];
