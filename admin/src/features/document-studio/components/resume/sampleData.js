// Provide default initial resume dataset with sample placeholder information
export const getDefaultResumeData = () => ({
  personalInfo: {
    fullName: 'Mahmudur Rahman',
    title: 'Senior Software Engineer & Team Lead',
    email: 'mahmudur.rahman@example.com',
    phone: '+880 1712-345678',
    location: 'Dhaka, Bangladesh',
    summary: 'Proactive and results-driven Software Engineer with 6+ years of experience designing scalable web and microservice platforms, optimizing cloud architectures, and mentoring high-performance technical teams.',
    avatarUrl: ''
  },
  experience: [
    {
      id: 'exp-1',
      company: 'Plexivia Technologies Ltd.',
      role: 'Lead Full-Stack Engineer',
      location: 'Dhaka, Bangladesh',
      startDate: '2022-01',
      endDate: 'Present',
      isCurrent: true,
      bullets: [
        'Architected and delivered multi-tenant ERP platform handling high volume transactions with 99.98% uptime.',
        'Led a core team of 8 engineers and spearheaded automated CI/CD and Dockerized VPS infrastructure deployments.'
      ]
    }
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'B.Sc. in Computer Science & Engineering',
      institution: 'University of Dhaka',
      location: 'Dhaka, Bangladesh',
      startDate: '2017',
      endDate: '2021',
      grade: 'First Class'
    }
  ],
  skills: [
    {
      id: 'skill-1',
      category: 'Technical & Engineering',
      items: ['React.js', 'Node.js', 'TypeScript', 'Tailwind CSS', 'Docker', 'PostgreSQL']
    },
    {
      id: 'skill-2',
      category: 'Management & Practices',
      items: ['Agile / Scrum', 'System Architecture', 'CI/CD Pipelines', 'Team Leadership']
    }
  ],
  settings: {
    template: 'modern-executive',
    accentColor: '#0284c7'
  }
});

export const SAMPLE_RESUME = getDefaultResumeData();

