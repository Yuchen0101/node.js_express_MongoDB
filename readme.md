# the basic code sturcture of express.js
* app.js -> for express middleware registration
    * middleware for static files -> we can then access the static resources
        ```jsx
        app.use(express.static(`${__dirname}/public`));
        // access in url without 'public': localhost:3000/overview.html
        ```
* server.js -> for server configuration
environment variables: global variable that defines the current environment
* xxxRoutes.js -> for routes definition
    * param middleware for centralized process of param
* xxxController.js -> for middleware handlers
    * chain multiple handlers for one middleware
* config.env -> environment configuration -> connect it to server.js
    * we can run the app using a command with a prepending NODE_ENV
    ```jsx
    NODE_ENV=development nodemon server.js
    ```

    * after configuration in config.env and server.js, we can get the environment configuration in code using a global variable:
    ```jsx
    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev')); // logging request
    }
    ```

    * modify the commands in package.json
    ```jsx
     "scripts": {
        "start:dev": "nodemon server.js",
        "start:prod": "NODE_ENV=production nodemon server.js"
    },
    ```
