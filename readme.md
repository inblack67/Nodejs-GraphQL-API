## GraphQL API with Node.js, TypeScript & PostgreSQL

- Create GraphQL API in Node.js & TypeScript. Every line of code will be striclty typed. No more "any" type intuitions and the flaws of JavaScript.

- We will be using Node.js with Express, Nexus Schema for GraphQL, Prisma as an ORM for PostgreSQL, Redis and of course everything will be written in TypeScript, including the auto generated code.

### Style

### Hands on

 - We will be spending majority of the time in our very own VS-Code. But we will also be using Playground/Insomnia for testing our GraphQL API.

 - I recommend you code along. And try to watch it at 1.5x speed at least. It saves time. 

### Architecture

 - Users

    - Register User (Create a new User)

    - Login (Session based authentication with caching in redis)

    - Get Authenticated User (Get the currently authenticated user details => more like an api which tells our api consumers that they are authenticated or not => will be judged by the validity of the cookie passed in the requests => our backend will check the cookie's validity and spit out 401 error if the cookie is invalid/absent)

    - Logout

    - Get all Users

  - Posts

    - Create Posts (A user can create as many posts it wants => one to many relationship)

    - Their relationship with User (Each post will be associated to a single user as it's author/creator => many to one relationship)

    - Get all Posts

### Tech Stack

- Language & Frameworks

  - Node.js

  - Express

  - TypeScript

- Libraries

  - PostgreSQL

    - @prisma/client

  - GraphQL

    - nexus (for code oriented GraphQL code base)

    - apollo-server-express

  - Authentication

    - express-session (for authentication => session based and cookies)

  - Redis Cache

    - ioredis

    - connect-redis (for storing sessions in redis,, for authentication)
