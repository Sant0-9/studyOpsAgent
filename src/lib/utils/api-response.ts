import { NextResponse } from 'next/server'

export function success<T>(data: T, status: number = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function error(message: string, status: number = 500, errors?: any) {
  return NextResponse.json(
    { success: false, error: message, errors },
    { status }
  )
}

export function notFound(message: string = 'Resource not found') {
  return error(message, 404)
}

export function badRequest(message: string = 'Bad request', errors?: any) {
  return error(message, 400, errors)
}

export function unauthorized(message: string = 'Unauthorized') {
  return error(message, 401)
}

export function serverError(message: string = 'Internal server error') {
  return error(message, 500)
}
