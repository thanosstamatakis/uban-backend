# uBan Web Application API

This is the official repo and project for the uBan web API.

### Requirements

- NodeJS [Install on Windows](https://nodejs.org/en/download/) / [Install on Ubuntu](https://hackernoon.com/how-to-install-node-js-on-ubuntu-16-04-18-04-using-nvm-node-version-manager-668a7166b854)
- MongoDB [Install on Windows](https://www.mongodb.com/download-center/community) / [Install on Ubuntu](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)

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
