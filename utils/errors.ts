import { Status } from "../deps/std/http.ts";

export abstract class CustomError extends Error {
  constructor(
    public message: string = "",
    public httpCode: number = Status.InternalServerError,
  ) {
    super();
  }
}

export class NotAuthenticatedError extends CustomError {
  constructor(
    public message = "Not authenticated.",
    public httpCode = Status.Forbidden,
  ) {
    super();
  }
}

export class InvalidDBKeyError extends CustomError {
  constructor(
    public message = "The DB key is invalid.",
    public httpCode = Status.BadRequest,
  ) {
    super();
  }
}

export class DBNotInitializedError extends CustomError {
  constructor(
    public message = "The DB has not been initialized.",
  ) {
    super();
  }
}
export class DBEntityAlreadyExisted extends CustomError {
  constructor(
    public message = "The DB entity has already existed.",
    public httpCode = Status.BadRequest,
  ) {
    super();
  }
}
export class DBEntityNotExisted extends CustomError {
  constructor(
    public message = "The DB entity does not exist.",
    public httpCode = Status.BadRequest,
  ) {
    super();
  }
}
export class DBEntityNotAsObject extends CustomError {
  constructor(
    public message = "DB entity is not as an object.",
    public httpCode = Status.BadRequest,
  ) {
    super();
  }
}
