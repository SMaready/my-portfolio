export type DegreeInfo = {
  degree: string
  university: string
  expectedGraduation: string
}

export type BuildingItem = {
  title: string
  description?: string
  githubUrl?: string
}

export const degreeInfo: DegreeInfo = {
  degree: 'B.S. Computer Science',
  university: 'Your University Name',
  expectedGraduation: 'May 2027',
}

export const buildingItems: BuildingItem[] = [
  {
    title: 'Portfolio Website',
    description: 'This site — built with Next.js, Tailwind CSS v4, and deployed on Vercel.',
    githubUrl: 'https://github.com/SMaready/portfolio',
  },
]
