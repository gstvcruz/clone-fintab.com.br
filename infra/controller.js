import {
  MethodNotAllowedError,
  InternalServerError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
} from "infra/errors";

function onNoMatchHandler(req, res) {
  const publicError = new MethodNotAllowedError();

  return res.status(publicError.statusCode).json(publicError);
}

function onErrorHandler(err, req, res) {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(err);
  }

  if (err instanceof NotFoundError) {
    return res.status(err.statusCode).json(err);
  }

  if (err instanceof UnauthorizedError) {
    return res.status(err.statusCode).json(err);
  }

  const publicError = new InternalServerError({
    cause: err,
  });

  console.error(publicError);

  return res.status(publicError.statusCode).json(publicError);
}

export const errorHandlers = {
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler,
};
