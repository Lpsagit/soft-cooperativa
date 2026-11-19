import { Request, Response, NextFunction } from "express";

interface SyntaxErrorWithStatus extends SyntaxError {
  status: number;
  body?: any;
}

export class ErrorJsonMiddleware {

  static handle(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (ErrorJsonMiddleware.isSyntaxError(err)) {
      console.error('[ErrorMiddleware] Invalid JSON:', err.message);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid JSON payload'
      });
    }

    console.error('[ErrorMiddleware] Unexpected:', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error'
    });
  }

  private static isSyntaxError(err: any): err is SyntaxErrorWithStatus {
    return (
      err instanceof SyntaxError &&
      typeof (err as SyntaxErrorWithStatus).status === 'number' &&
      (err as SyntaxErrorWithStatus).status === 400 &&
      'body' in err
    );
  }

}
