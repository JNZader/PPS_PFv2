export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthError extends AppError {
  constructor(message: string, code?: string) {
    super(message, code, 401);
    this.name = 'AuthError';
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message = 'Error de conexión') {
    super(message, 'NETWORK_ERROR', 500);
    this.name = 'NetworkError';
  }
}

export const handleError = (error: unknown): string => {
  console.error('Error:', error);

  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ha ocurrido un error inesperado';
};
