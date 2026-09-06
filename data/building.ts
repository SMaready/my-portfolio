export type BuildingItem = {
  title: string
  status: 'active' | 'next'
  lines: string[]
}

/** Bump this whenever you edit the list below — it's shown on the site. */
export const buildingUpdated = 'September 2026'

export const buildingItems: BuildingItem[] = [
  {
    title: 'Tactus XR',
    status: 'active',
    lines: [
      'Quest 3 standalone APK packaging and the Windows PCVR build both succeed — that was the plan’s biggest risk and it’s closed.',
      'Currently on the pawn and input abstraction layer. Midterm review in October, final in December.',
    ],
  },
  {
    title: 'ReadySetRender',
    status: 'active',
    lines: [
      'Window and OpenGL context layer done and wrapped in RAII.',
      'Next: shader and program abstraction, then a first textured mesh through a forward pass.',
    ],
  },
  {
    title: 'Simulation-first robotics',
    status: 'next',
    lines: [
      'Starting two robotics projects chosen so the simulation side connects back to the Unreal work rather than sitting apart from it.',
    ],
  },
]
