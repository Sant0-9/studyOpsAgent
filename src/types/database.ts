import {
  Assignment as PrismaAssignment,
  StudyMaterial as PrismaStudyMaterial,
  WorkSession as PrismaWorkSession,
  Error as PrismaError,
  Concept as PrismaConcept,
  Settings as PrismaSettings,
  AssignmentStatus,
  MaterialType,
  ActivityType,
  ErrorType,
  HelpLevel
} from '@prisma/client'

// Re-export Prisma types
export type Assignment = PrismaAssignment
export type StudyMaterial = PrismaStudyMaterial
export type WorkSession = PrismaWorkSession
export type Error = PrismaError
export type Concept = PrismaConcept
export type Settings = PrismaSettings

// Re-export enums
export {
  AssignmentStatus,
  MaterialType,
  ActivityType,
  ErrorType,
  HelpLevel
}

// Extended types with relations
export type AssignmentWithRelations = Assignment & {
  studyMaterials?: StudyMaterial[]
  workSessions?: WorkSession[]
  errors?: Error[]
}

export type WorkSessionWithRelations = WorkSession & {
  assignment?: Assignment | null
  errors?: Error[]
}

export type ErrorWithRelations = Error & {
  session?: WorkSession | null
  assignment?: Assignment | null
}
