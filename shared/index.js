// Main entry point for the shared package
import * as mongoDB from './mongoDB/index.js';
import * as graphql from './graphql/index.js';
// import * as validations from './validations/common.js';

export { mongoDB, graphql };

// Convenience exports
export const {
    models,
    mongoose,
    connectDB,
    initializeDB,
    utils
} = mongoDB;

export const {
    typeDefs,
    resolvers,
    createApolloServer,
    applyApolloMiddleware,
    createContext,
    ApolloServer,
    expressMiddleware
} = graphql; 