import { AppError } from './app.error';

export class ValidationError extends AppError {
  public readonly details?: unknown;

  constructor(message: string = 'Validation failed', details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}
