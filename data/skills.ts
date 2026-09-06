export type SkillGroup = {
  domain: string
  /** Things I've shipped something with. */
  working: string[]
  /** Things I'm deliberately learning right now. Honest, not aspirational filler. */
  sharpening: string[]
}

export const skills: SkillGroup[] = [
  {
    domain: 'Graphics & Rendering',
    working: ['OpenGL', 'GLSL', 'GLFW', 'glad', 'Render loop architecture'],
    sharpening: ['Vulkan', 'PBR shading models', 'DirectX 12'],
  },
  {
    domain: 'Engines & XR',
    working: ['Unreal Engine 5', 'Blueprint', 'UE5 C++ modules', 'OpenXR', 'Meta XR', 'Quest 3 packaging'],
    sharpening: ['UE5 materials & lighting', 'Replication & netcode'],
  },
  {
    domain: 'Languages',
    working: ['C++ (17/20/23)', 'Python', 'SQL', 'C#', 'TypeScript'],
    sharpening: ['Concurrency', 'Profiling & optimisation'],
  },
  {
    domain: 'Systems & Tooling',
    working: ['CMake', 'vcpkg', 'Perforce', 'Git', 'Visual Studio', 'Android SDK/NDK'],
    sharpening: ['Linux cross-compilation', 'CI for native builds'],
  },
  {
    domain: 'Machine Learning',
    working: ['scikit-learn', 'pandas', 'NumPy', 'Jupyter'],
    sharpening: ['PyTorch', 'RL for simulation'],
  },
]
