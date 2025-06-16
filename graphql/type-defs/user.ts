import { gql } from 'graphql-tag';

export const userTypeDefs = gql`
  type User {
    _id: ID!
    name: String!
    email: String!
    number: String!
    createdAt: String
    updatedAt: String
  }

  type AuthPayload {
    status: Boolean!
    message: String!
    user: User
    token: String
  }

  type UserResponse {
    status: Boolean!
    message: String!
    data: User
  }

  type UpdateUserResponse {
    status: Boolean!
    message: String!
    data: User
  }

  input RegisterInput {
    name: String!
    email: String!
    number: String!
    password: String!
    confirm_password: String!
  }

  input LoginInput {
    emailOrNumber: String!
    password: String!
  }

  input UpdateUserInput {
    name: String
    email: String
    number: String
  }

  type Query {
    healthCheck: HealthResponse!
    getUser: UserResponse!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    updateUser(input: UpdateUserInput!): UpdateUserResponse!
  }

  type HealthResponse {
    status: Boolean!
    message: String!
  }
`;