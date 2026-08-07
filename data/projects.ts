export type DomainTag =
  | 'Game Dev & Simulation'
  | 'Graphics & Rendering'
  | 'Machine Learning'
  | 'Systems Programming'

export type Project = {
  id: string
  title: string
  description: string
  fullDescription: string
  tags: DomainTag[]
  techStack: string[]
  githubUrl: string
  thumbnailPath: string
  videoUrl: string
}

export const projects: Project[] = [
  {
    id: 'custom-game-engine',
    title: 'Custom Game Engine',
    description: 'A 3D game engine built in C++ with an OpenGL renderer and entity-component system.',
    fullDescription: 'A from-scratch 3D game engine implemented in C++ featuring a deferred rendering pipeline with OpenGL, a cache-friendly entity-component system, a scene graph, and a custom asset pipeline for meshes and textures. Built to understand the internals of production engines like Unreal.',
    tags: ['Game Dev & Simulation', 'Graphics & Rendering'],
    techStack: ['C++', 'OpenGL', 'GLSL', 'CMake'],
    githubUrl: 'https://github.com/SMaready/game-engine',
    thumbnailPath: '/thumbnails/custom-game-engine.jpg',
    videoUrl: '',
  },
  {
    id: 'neural-style-transfer',
    title: 'Neural Style Transfer',
    description: 'Real-time artistic style transfer applied to live video using a pre-trained CNN.',
    fullDescription: 'Implements fast neural style transfer using a feed-forward convolutional network trained on a single style image. Processes live webcam frames at near-real-time speeds by separating style training from inference. Built to explore the intersection of computer vision and graphics.',
    tags: ['Machine Learning', 'Graphics & Rendering'],
    techStack: ['Python', 'PyTorch', 'OpenCV', 'CUDA'],
    githubUrl: 'https://github.com/SMaready/neural-style-transfer',
    thumbnailPath: '/thumbnails/neural-style-transfer.jpg',
    videoUrl: '',
  },
]
