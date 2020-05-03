# uBan Web Application API

This is the official repo and project for the uBan web API.

### Requirements

- NodeJS
- MongoDB

### Install Instructions

```BASH
    cd backend
    npm install
    npm run dev
```

You can access the swagger UI of the site's local version at http://localhost:5000/api-docs

### Local Config

Before you start the project the you need to create a config.yaml file following the instructions of the config.template.yaml file. This is mandatory because all the server setting are read from that file. Specifically copy the following command:

```BASH
    cp config/config.template.yaml config/config.yaml
```

and then set these parameters in the `config/config.yaml` file.

```YAML
        email:
            service: 'gmail'
            user: <email>
            password: <password>
        backend:
            ip: 'localhost'
            port: 5000
        frontend:
            ip: 'localhost'
            port: 4200
        database:
            ip: 'localhost'
            port: '27017'
            name: 'uban'
        google-oauth:
            client-id: <oAuthClientId>
```
