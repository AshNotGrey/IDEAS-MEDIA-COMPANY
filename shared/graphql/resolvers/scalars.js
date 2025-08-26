import { GraphQLScalarType, Kind } from 'graphql';

// DateTime scalar resolver
const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  
  serialize(value) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'number') {
      return new Date(value).toISOString();
    }
    return null;
  },
  
  parseValue(value) {
    if (typeof value === 'string') {
      return new Date(value);
    }
    if (typeof value === 'number') {
      return new Date(value);
    }
    return null;
  },
  
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10));
    }
    return null;
  },
});

// Date scalar resolver
const DateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  
  serialize(value) {
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    if (typeof value === 'string') {
      return value.split('T')[0];
    }
    return null;
  },
  
  parseValue(value) {
    if (typeof value === 'string') {
      return new Date(value);
    }
    return null;
  },
  
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

// Time scalar resolver
const TimeScalar = new GraphQLScalarType({
  name: 'Time',
  description: 'Time custom scalar type',
  
  serialize(value) {
    if (value instanceof Date) {
      return value.toTimeString().split(' ')[0];
    }
    if (typeof value === 'string') {
      return value;
    }
    return null;
  },
  
  parseValue(value) {
    if (typeof value === 'string') {
      return value;
    }
    return null;
  },
  
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return ast.value;
    }
    return null;
  },
});

// JSON scalar resolver
const JSONScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON custom scalar type',
  
  serialize(value) {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    if (typeof value === 'string') {
      try {
        JSON.parse(value);
        return value;
      } catch {
        return null;
      }
    }
    return null;
  },
  
  parseValue(value) {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    }
    if (typeof value === 'object' && value !== null) {
      return value;
    }
    return null;
  },
  
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      try {
        return JSON.parse(ast.value);
      } catch {
        return null;
      }
    }
    if (ast.kind === Kind.OBJECT) {
      return ast.value;
    }
    return null;
  },
});

export const scalarResolvers = {
  DateTime: DateTimeScalar,
  Date: DateScalar,
  Time: TimeScalar,
  JSON: JSONScalar,
};

export default scalarResolvers;
