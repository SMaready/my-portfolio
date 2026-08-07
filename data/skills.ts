export type SkillGroup = {
  domain: string
  proficient: string[]
  exploring: string[]
}

export const skills: SkillGroup[] = [
  {
    domain: 'Game Development',
    proficient: ['C++', 'Unreal Engine', 'Entity-Component Systems', 'Game Physics'],
    exploring: ['Godot', 'Zig', 'Multiplayer Netcode'],
  },
  {
    domain: 'Graphics & Rendering',
    proficient: ['OpenGL', 'GLSL', 'Deferred Rendering', 'Shadow Mapping'],
    exploring: ['Vulkan', 'WebGPU', 'Ray Tracing'],
  },
  {
    domain: 'Machine Learning',
    proficient: ['Python', 'PyTorch', 'CNNs', 'Data Pipelines'],
    exploring: ['Diffusion Models', 'Reinforcement Learning', 'CUDA Kernels'],
  },
  {
    domain: 'Systems Programming',
    proficient: ['C++', 'Memory Management', 'CMake', 'Profiling'],
    exploring: ['Zig', 'Rust', 'WASM'],
  },
]
