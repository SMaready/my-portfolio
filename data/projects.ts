export type DomainTag =
  | 'Graphics & Rendering'
  | 'Engines & XR'
  | 'Game Dev'
  | 'Systems'
  | 'Machine Learning'

export type ProjectStatus = 'In development' | 'Shipped' | 'Complete'

export type ProjectLink = {
  label: string
  href: string
}

export type Project = {
  id: string
  index: string
  title: string
  kicker: string
  year: string
  status: ProjectStatus
  /** One line. Shown collapsed. */
  summary: string
  /** Prose shown when the row is expanded. */
  detail: string[]
  /** Concrete, checkable claims. Shown when expanded. */
  highlights: string[]
  tags: DomainTag[]
  stack: string[]
  links: ProjectLink[]
  /** Repo is private — say so rather than shipping a link that 404s. */
  privateRepo?: boolean
}

export const projects: Project[] = [
  {
    id: 'tactus-xr',
    index: '01',
    title: 'Tactus XR',
    kicker: 'Independent study · CPSC 499',
    year: '2026',
    status: 'In development',
    summary:
      'A modular VR interaction toolkit for Unreal Engine 5 — a C++ plugin exposed to Blueprint, with an escape room and an industrial training sim as its demonstrations.',
    detail: [
      'A semester-long independent study at Cal State Fullerton, advised by Dr. Rong Jin. The toolkit ships as an Unreal plugin — grab and manipulation, an input abstraction over OpenXR, locomotion, and UI interaction — and the two demos exist to prove the toolkit works, not the other way round.',
      'The structural rule is that the plugin never depends on the demo project. Anything the escape room needs that the toolkit does not provide is a gap in the toolkit, and gets fixed there. Developer documentation is the primary written deliverable, not an afterthought.',
      'It targets OpenXR only, which means the same build path covers Quest 3 standalone and PCVR without a vendor fork. My advisor has raised open-sourcing it for other students once the semester ends.',
    ],
    highlights: [
      'C++ core with a Blueprint-exposed API — TACTUS_API, ATactusPawn, UTactusInputConfig',
      'Ships to Quest 3 standalone (Android) and PCVR from one OpenXR codebase',
      'Android packaging pinned to the engine toolchain: SDK 34, NDK 27, JDK 21',
      'Second demo teaches a six-step industrial lockout/tagout procedure',
      'Versioned in a self-hosted Perforce depot, the way a studio would',
    ],
    tags: ['Engines & XR', 'Graphics & Rendering'],
    stack: ['C++', 'Unreal Engine 5.7', 'OpenXR', 'Meta XR', 'Blueprint', 'Perforce'],
    links: [],
    privateRepo: true,
  },
  {
    id: 'ready-set-render',
    index: '02',
    title: 'ReadySetRender',
    kicker: 'Personal · real-time renderer',
    year: '2026',
    status: 'In development',
    summary:
      'A real-time renderer written from scratch in modern C++ — no engine, starting at window creation and a raw OpenGL context.',
    detail: [
      'I wanted to know what an engine is actually doing before I kept building on top of one. So this starts where the engine starts: an rsr::Window type that owns GLFW initialisation, the context, and its teardown through RAII, with glad loading the core profile behind it.',
      'It builds through CMake presets with vcpkg pinned as a submodule, so the dependency set is reproducible rather than "works on my machine". The next layer up is a shader and program abstraction, then a first textured mesh through a forward pass.',
      'This is the project most directly pointed at where I want to end up — production rendering.',
    ],
    highlights: [
      'RAII wrapper around GLFW window + OpenGL core-profile context',
      'CMake presets + vcpkg manifest for a reproducible dependency graph',
      'Separated renderer module from the application layer at the start, not later',
    ],
    tags: ['Graphics & Rendering', 'Systems'],
    stack: ['C++', 'OpenGL', 'GLFW', 'glad', 'CMake', 'vcpkg'],
    links: [],
    privateRepo: true,
  },
  {
    id: 'game-server-scheduler',
    index: '03',
    title: 'Game Server Scheduler',
    kicker: 'Operating Systems · CPSC 351 · team of 3',
    year: '2026',
    status: 'Complete',
    summary:
      'A CPU scheduling simulator modelled on a real-time battle arena server, where every player action — move, attack, heal, cast — is a process competing for CPU time.',
    detail: [
      'The framing was the point: hundreds of players hitting a server at once, and one millisecond of scheduling delay deciding a fight. That gave each algorithm a job rather than a definition. Round Robin handles movement and basic attacks because it keeps every player responsive and stops one spammer from stalling the server. Priority handles combat, where a heal arriving late is the same as a heal that never arrived. FCFS handles the things nobody feels — stat logging, quest progress, cosmetic loads.',
      'The simulator takes arrival and burst times per process, plus a quantum or a priority where the algorithm needs one, and prints a Gantt-style execution timeline including idle blocks, then per-process completion, turnaround and waiting times with averages.',
      'We then ran three scenarios through all three algorithms and compared the numbers instead of asserting which was best — and the answer changed per scenario, which was the interesting part.',
    ],
    highlights: [
      'FCFS, Round Robin with a configurable quantum, and non-preemptive Priority',
      'ProcessInfo base class with per-algorithm subclasses; Scheduler owns the algorithms',
      'ExecutionEvent records contiguous CPU blocks, so idle time is visible in the timeline',
      'Three scenarios benchmarked — a long map load starves combat under FCFS, and Round Robin wins it back',
    ],
    tags: ['Systems', 'Game Dev'],
    stack: ['C++', 'OOP design', 'Visual Studio'],
    links: [{ label: 'Repository', href: 'https://github.com/SMaready/CSUF-351-Project' }],
  },
  {
    id: 'ml-soccer',
    index: '04',
    title: 'Net Impact — Match Prediction',
    kicker: 'Machine Learning · CPSC 483 · team of 3',
    year: '2026',
    status: 'Complete',
    summary:
      'A soccer match-outcome classifier taken end to end — raw dataset through preprocessing, four algorithms, and a like-for-like evaluation.',
    detail: [
      'Rather than tune one model, we ran four across the same preprocessed dataset so the comparison meant something: a decision tree, Gaussian Naive Bayes, K-nearest neighbours, and a random forest.',
      'The preprocessing notebook is the part I would defend hardest — it emits a single cleaned CSV that every model reads, so no model gets an accidental advantage from a different feature set. Trained models are serialised so the evaluation run is reproducible without retraining.',
      'Evaluation metrics and comparison plots are exported to a single PDF, which is how the result was actually argued.',
    ],
    highlights: [
      'One shared preprocessing pipeline feeding all four classifiers',
      'Decision tree, Gaussian Naive Bayes, KNN, and random forest compared on identical splits',
      'Models serialised for reproducible evaluation; metrics and plots exported to PDF',
    ],
    tags: ['Machine Learning'],
    stack: ['Python', 'scikit-learn', 'pandas', 'Jupyter', 'matplotlib'],
    links: [{ label: 'Repository', href: 'https://github.com/SMaready/ML-Soccer-Project' }],
  },
  {
    id: 'galaga',
    index: '05',
    title: 'Galaga',
    kicker: 'Game design · CPSC 386',
    year: '2026',
    status: 'Complete',
    summary:
      'A Galaga clone in Python and Pygame — wave-based spawning, spline-driven attack runs, and a scene-managed game loop.',
    detail: [
      'The interesting problem here was enemy movement. Galaga enemies do not travel in straight lines; they peel out of formation along a curve and come back. I drove those attack runs with Catmull-Rom splines so the path is defined by a handful of control points and the curve stays smooth through all of them.',
      'Everything else is structure: a scene manager owning title, play, and game-over states, an entity/component split for actors, a scrolling parallax starfield, and a leaderboard persisted between runs.',
    ],
    highlights: [
      'Catmull-Rom spline paths for enemy dive animations',
      'Wave-based spawning with a scene-managed game loop',
      'Scrolling parallax background; player revival with ghost-blink invulnerability',
      'Pickle-backed leaderboard persisted across sessions',
    ],
    tags: ['Game Dev'],
    stack: ['Python', 'Pygame', 'OOP design'],
    links: [],
    privateRepo: true,
  },
  {
    id: 'pong',
    index: '06',
    title: 'Pong',
    kicker: 'Game design · CPSC 386',
    year: '2026',
    status: 'Complete',
    summary:
      'Pong built from scratch in Pygame — object-oriented, scene-driven, with a computer opponent and paddle-dependent deflection.',
    detail: [
      'Written to the original arcade behaviour rather than the simplified version: walls reflect true, but the paddle does not. Where the ball strikes the paddle changes the outgoing angle, which is what makes the game playable rather than a stalemate.',
      'A title scene explains the controls, a serve cue gives the player a beat to react before the ball leaves the centre, and a match runs to three points against an AI opponent.',
    ],
    highlights: [
      'Position-dependent paddle deflection; true angle-of-incidence wall bounces',
      'Title → play → result scene flow with a pre-serve readiness cue',
      'Human versus computer opponent, first to three points',
    ],
    tags: ['Game Dev'],
    stack: ['Python', 'Pygame', 'OOP design'],
    links: [],
    privateRepo: true,
  },
]
