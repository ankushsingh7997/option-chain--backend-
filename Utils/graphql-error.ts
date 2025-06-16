import { GraphQLError } from 'graphql';

/**
 * Throws a GraphQLError with a given message and code.
 * @param message - Error message to show in response.
 * @param code - Optional GraphQL error code (e.g., UNAUTHENTICATED, BAD_USER_INPUT).
 */
export function throwGraphQLError(message: string, code: string = "INTERNAL_SERVER_ERROR"): never {
  throw new GraphQLError(message, {
    extensions: { code }
  });
}
