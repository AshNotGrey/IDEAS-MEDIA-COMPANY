// Custom GraphQL error classes for Apollo Server v5
// These replace the deprecated apollo-server-errors classes

export class AuthenticationError extends Error {
    constructor(message = 'Authentication required') {
        super(message);
        this.name = 'AuthenticationError';
        this.extensions = {
            code: 'UNAUTHENTICATED',
            http: { status: 401 }
        };
    }
}

export class UserInputError extends Error {
    constructor(message = 'Invalid input') {
        super(message);
        this.name = 'UserInputError';
        this.extensions = {
            code: 'BAD_USER_INPUT',
            http: { status: 400 }
        };
    }
}

export class ForbiddenError extends Error {
    constructor(message = 'Access denied') {
        super(message);
        this.name = 'ForbiddenError';
        this.extensions = {
            code: 'FORBIDDEN',
            http: { status: 403 }
        };
    }
}

export class NotFoundError extends Error {
    constructor(message = 'Resource not found') {
        super(message);
        this.name = 'NotFoundError';
        this.extensions = {
            code: 'NOT_FOUND',
            http: { status: 404 }
        };
    }
}

export class InternalServerError extends Error {
    constructor(message = 'Internal server error') {
        super(message);
        this.name = 'InternalServerError';
        this.extensions = {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 }
        };
    }
}

// Helper function to create appropriate error based on type
export function createGraphQLError(type, message) {
    switch (type) {
        case 'AUTHENTICATION':
            return new AuthenticationError(message);
        case 'USER_INPUT':
            return new UserInputError(message);
        case 'FORBIDDEN':
            return new ForbiddenError(message);
        case 'NOT_FOUND':
            return new NotFoundError(message);
        case 'INTERNAL':
            return new InternalServerError(message);
        default:
            return new Error(message);
    }
}
