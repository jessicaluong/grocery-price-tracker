export class DuplicateGroupError extends Error {
  constructor(message = "A group with these exact details already exists") {
    super(message);
    this.name = "DuplicateGroupError";
  }
}

export class AuthorizationError extends Error {
  constructor(message = "You don't have permission to perform this action") {
    super(message);
    this.name = "AuthorizationError";
  }
}
