import { gql } from 'graphql-tag';

export const BrokerTypeDefs = gql`
  type Broker {
    _id: ID!
    broker: String!
    userId: String!
    actid: String!
    accessToken: String
    loginStatus: Boolean!
    lastLoginAt: String
  }

  input BrokerPayload {
    actid: String!
    request_token: String
  }

  input RegisterBroker {
    broker: String!
    actid: String!
  }

  input RemoveBrokerInput {
    actid: String!
  }

  type BrokerResponse {
    status: Boolean!
    message: String!
    data: Broker
  }

  type AllBrokerResponse {
    status: Boolean!
    message: String!
    data: [Broker]
  }

  type BrokerLoginResponse {
    status: Boolean!
    message: String!
    accessToken: String
    redirect_uri: String
  }

  type RemoveBrokerResponse {
    status: Boolean!
    message: String!
  }

  type Query {
    getBroker(actid: String!): BrokerResponse!
    getAllBrokers: AllBrokerResponse!
  }

  type Mutation {
    registerBroker(input: RegisterBroker!): BrokerResponse!
    loginBroker(input: BrokerPayload!): BrokerLoginResponse!
    removeBroker(input: RemoveBrokerInput!): RemoveBrokerResponse!
  }
`;