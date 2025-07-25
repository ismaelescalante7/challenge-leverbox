<p align="center">
  <img src="https://laravelvuespa.com/preview-dark.png" width="400" />
</p>

# Laravel & Vue SPA Starter Kit
[![](https://img.shields.io/badge/vue.js-v2.6-04C690.svg)](https://vuejs.org/)
[![](https://img.shields.io/badge/Laravel-v10.0-ff2e21.svg)](https://laravel.com)
![Test PHP](https://github.com/fumeapp/laranuxt/workflows/Test%20PHP/badge.svg)
[![Lint PHP](https://github.com/fumeapp/laranuxt/actions/workflows/lint-php.yml/badge.svg)](https://github.com/fumeapp/laranuxt/actions/workflows/lint-php.yml)

## Technology
- PHP-FPM 8.1
- Laravel 10
- Vue 3, Pinia
- Sanctum for Authentication (session)
- Fortify
- Docker & Docker Compose
- Nginx
- Mysql
- Redis
- Redis Queues
- Task Scheduling

## How it works
### Containers
1) **api**: serves the backend app (laravel app)
2) **client**: serves the fronted app (vue app)
3) **webserver**: services static content, storage, and passes traffic to api & client containers (proxy)
4) **mysql**: main database connection
5) **redis**: cache driver / queue connection
6) **worker**: runs queue workers & crontab

## Installation
### Development Environment
it includes compiling and hot-reloading for development
```
cp api/.env.dev.example api/.env.dev

// then =>

docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

// then =>

// run the migrations
docker exec -it api php artisan migrate --seed
```
- To access the api open http://localhost:8000
- To access the client open http://localhost:3000
- To access the Mailpit open http://localhost:8025

### Staging Environment
Compiles and minifies for staging
```
docker-compose -f docker-compose.yml -f docker-compose.stg.yml up --build
```

### Production Environment
Compiles and minifies for production
```
docker-compose -f docker-compose.yml -f docker-compose.prd.yml up --build
```

## Customize configuration
#### 1) Vue Env [Configuration Reference](https://cli.vuejs.org/config/).


## Roadmap
* [x] Laravel, Sunctum, and Fortify installations
* [x] Vue 3
* [x] Login
* [x] Task Create
* [x] Task Update
* [x] Task Show
* [x] Task View
* [x] Dashboard task
* [x] Filters taks

## Contributing
Contributions are **welcome** and will be fully **credited**.