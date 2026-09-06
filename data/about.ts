export type Fact = {
  label: string
  value: string
}

export const about = {
  /** The typing line in the hero. Kept short — it has to read at a glance. */
  hero: {
    name: 'Stephan Maready',
    prefix: 'I build',
    rotating: [
      'real-time renderers.',
      'VR interaction systems.',
      'gameplay systems in Unreal.',
      'things that hold 90 fps.',
    ],
    meta: [
      { label: 'Discipline', value: 'Graphics · Gameplay · Simulation' },
      { label: 'Based', value: 'Fullerton, California' },
      { label: 'Status', value: 'Open to Summer 2027 internships' },
    ] satisfies Fact[],
  },

  paragraphs: [
    "I'm a computer science student at Cal State Fullerton, graduating in 2027. I spend most of my time on the part of software you can watch run — renderers, engines, and the systems underneath games.",
    "I got here the long way. After high school I worked full time and went to school part time before committing to CS, and that left me with a habit I still have: I would rather build one thing all the way down than five things halfway. It's why my renderer starts at window creation and a raw OpenGL context instead of an engine, and why my VR toolkit is a documented C++ plugin rather than a demo project with the useful parts buried inside it.",
    "C++ is where I'm most comfortable, and I work in Python and SQL alongside it. Right now I'm building Tactus XR — a modular VR interaction toolkit for Unreal Engine 5 — as a semester-long independent study, and ReadySetRender, a renderer I'm writing from scratch to understand the layer underneath the graphics API.",
    "Long term I want to write renderers; production rendering at a studio like DreamWorks is the target I've had in mind for a while. Nearer term I'm looking for a Summer 2027 internship in Unreal Engine work, graphics programming, or simulation.",
  ],

  facts: [
    { label: 'Education', value: 'B.S. Computer Science, Cal State Fullerton — 2027' },
    { label: 'Primary language', value: 'C++ · also Python, SQL, C#' },
    { label: 'Currently', value: 'CPSC 499 independent study — Tactus XR' },
    { label: 'Interests', value: 'Real-time rendering, XR, simulation, soccer analytics' },
    { label: 'Looking for', value: 'Summer 2027 internship — Unreal, graphics, or simulation' },
  ] satisfies Fact[],
}

export const contact = {
  email: 'stephan.maready@gmail.com',
  github: 'https://github.com/SMaready',
  linkedin: 'https://www.linkedin.com/in/stephan-maready/',
}
