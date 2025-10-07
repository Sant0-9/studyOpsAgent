import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seeding...')

  // Create default settings
  const settings = [
    {
      key: 'study_block_duration',
      value: JSON.stringify(25),
      description: 'Default study block duration in minutes',
    },
    {
      key: 'break_duration',
      value: JSON.stringify(5),
      description: 'Default break duration in minutes',
    },
    {
      key: 'long_break_duration',
      value: JSON.stringify(15),
      description: 'Long break duration in minutes',
    },
    {
      key: 'work_hours_start',
      value: JSON.stringify(9),
      description: 'Work hours start time (0-23)',
    },
    {
      key: 'work_hours_end',
      value: JSON.stringify(21),
      description: 'Work hours end time (0-23)',
    },
    {
      key: 'daily_study_goal',
      value: JSON.stringify(4),
      description: 'Daily study goal in hours',
    },
  ]

  for (const setting of settings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }

  console.log('Created default settings')

  // Create sample concepts
  const concepts = [
    // Programming Concepts
    {
      name: 'Variables',
      category: 'Programming Basics',
      description: 'Understanding variable declaration, assignment, and scope',
      masteryLevel: 0.5,
    },
    {
      name: 'Functions',
      category: 'Programming Basics',
      description: 'Creating and using functions with parameters and return values',
      masteryLevel: 0.6,
    },
    {
      name: 'Loops',
      category: 'Control Flow',
      description: 'For loops, while loops, and iteration patterns',
      masteryLevel: 0.4,
    },
    {
      name: 'Conditionals',
      category: 'Control Flow',
      description: 'If-else statements and boolean logic',
      masteryLevel: 0.7,
    },
    {
      name: 'Arrays',
      category: 'Data Structures',
      description: 'Array creation, manipulation, and common methods',
      masteryLevel: 0.5,
    },
    {
      name: 'Objects',
      category: 'Data Structures',
      description: 'Object-oriented programming and data modeling',
      masteryLevel: 0.3,
    },
    {
      name: 'Async/Await',
      category: 'Advanced JavaScript',
      description: 'Asynchronous programming with promises and async functions',
      masteryLevel: 0.2,
    },
    {
      name: 'REST APIs',
      category: 'Web Development',
      description: 'Understanding RESTful API design and HTTP methods',
      masteryLevel: 0.4,
    },
    {
      name: 'Database Queries',
      category: 'Databases',
      description: 'SQL queries, joins, and database operations',
      masteryLevel: 0.3,
    },
    {
      name: 'Git Version Control',
      category: 'Tools',
      description: 'Using Git for version control and collaboration',
      masteryLevel: 0.6,
    },
  ]

  for (const concept of concepts) {
    await prisma.concept.upsert({
      where: { name: concept.name },
      update: {},
      create: concept,
    })
  }

  console.log('Created sample concepts')

  // Optionally create a sample assignment in development
  if (process.env.NODE_ENV !== 'production') {
    const sampleAssignment = await prisma.assignment.create({
      data: {
        title: 'Build a To-Do App',
        course: 'Web Development 101',
        description: 'Create a full-stack to-do application with CRUD operations',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: 'IN_PROGRESS',
        priority: 1,
        estimatedHours: 10,
        completionPercentage: 30,
        requirements: JSON.stringify([
          'User interface for adding tasks',
          'Database for storing tasks',
          'Edit and delete functionality',
          'Mark tasks as complete',
          'Responsive design',
        ]),
        rubric: 'Functionality (40%), Code Quality (30%), Design (20%), Documentation (10%)',
      },
    })

    console.log('Created sample assignment:', sampleAssignment.title)
  }

  console.log('Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
