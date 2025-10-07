# StudyOps Agent

A comprehensive study and assignment management web application built with Next.js 14, designed to help students track assignments, manage study sessions, analyze errors, and master concepts through intelligent tracking and AI assistance.

## Features

### Core Features
- **Assignment Management**: Create, track, and manage assignments with deadlines, requirements, and progress tracking
- **Study Session Tracking**: Timer-based study sessions with activity tracking and focus scoring
- **Material Management**: Upload and organize study materials (PDFs, images, documents) with automatic text extraction
- **Error Logging**: Track and analyze mistakes to learn from patterns and improve over time
- **Concept Mastery**: Spaced repetition system for tracking learned concepts and reviewing at optimal intervals
- **Analytics Dashboard**: Comprehensive visualizations of study habits, productivity, and progress
- **AI Study Buddy**: Integrated AI assistant for homework help, explanations, and study guidance
- **Notifications**: Smart reminders for deadlines, study sessions, and concept reviews

### Technical Features
- Fully responsive design for desktop, tablet, and mobile
- Modern, beautiful UI with shadcn/ui components
- Dark mode support
- Progressive Web App (PWA) capabilities
- Offline support
- Real-time data synchronization

## Tech Stack

### Frontend
- **Next.js 14** with App Router
- **React 18** with Server and Client Components
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Recharts** for data visualization

### Backend
- **Next.js API Routes** for serverless functions
- **Prisma ORM** for database operations
- **SQLite** (development) / **PostgreSQL** (production)
- **Server Actions** for mutations

### Additional Libraries
- **react-hook-form** + **Zod** for form handling and validation
- **Zustand** for state management
- **date-fns** for date manipulation
- **lucide-react** for icons
- **pdf-parse** for PDF text extraction
- **OpenAI API** (optional) for AI features

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Git

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd studyops-agent
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and configure:
- `DATABASE_URL`: Database connection string
- `OPENAI_API_KEY`: OpenAI API key (optional, for AI features)
- Other configuration as needed

4. Initialize the database:
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Database Management

### Prisma Commands

Generate Prisma Client:
```bash
npx prisma generate
```

Push schema changes to database:
```bash
npx prisma db push
```

Run migrations:
```bash
npx prisma migrate dev
```

Seed the database:
```bash
npx prisma db seed
```

Open Prisma Studio (database GUI):
```bash
npx prisma studio
```

## Environment Variables

### Required
- `DATABASE_URL`: Database connection URL
- `NEXT_PUBLIC_APP_NAME`: Application name
- `NEXT_PUBLIC_APP_VERSION`: Application version

### Optional
- `OPENAI_API_KEY`: OpenAI API key for AI study buddy features
- `NEXTAUTH_SECRET`: Secret for authentication (if using multi-user mode)
- `NEXTAUTH_URL`: Application URL for authentication

## Project Structure

```
studyops-agent/
├── src/
│   ├── app/                # Next.js App Router pages and API routes
│   │   ├── api/           # API route handlers
│   │   ├── assignments/   # Assignment pages
│   │   ├── study/         # Study session pages
│   │   ├── materials/     # Material management pages
│   │   ├── analytics/     # Analytics dashboard
│   │   ├── settings/      # Settings pages
│   │   └── layout.tsx     # Root layout
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── features/     # Feature-specific components
│   │   └── layout/       # Layout components
│   ├── lib/              # Utilities and helpers
│   │   ├── db/          # Database utilities
│   │   ├── actions/     # Server Actions
│   │   ├── hooks/       # Custom React hooks
│   │   ├── validations/ # Zod schemas
│   │   └── utils/       # Helper functions
│   ├── types/            # TypeScript type definitions
│   └── styles/           # Global styles
├── prisma/               # Prisma schema and migrations
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Database seeding script
├── public/               # Static assets
└── package.json
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database ORM by [Prisma](https://www.prisma.io/)
- Icons by [Lucide](https://lucide.dev/)

Built with care for students, by students.
