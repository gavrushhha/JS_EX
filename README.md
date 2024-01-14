# E-COMMERCE SHOP

## Цель
1. В проекте предоставлено MVP проекта продажи продуктов с возможностью его масштабирования.
2. Получить базовые знания разработки серверных приложений с использованием [Node.JS](https://nodejs.org/ru),[Express](https://expressjs.com/)

## Функционал
На данный момент мы имеем минимально необходимый функционал, который будет пополняться:
- Предоставить пользователю возможности использования приобретения продуктов.
- Сервис авторизации пользователя.


## Роутинг.
- localhost:4005/auth/registration
- localhost:4005/auth/login
- localhost:4005/auth/users

- localhost:4005/orders/:id
- localhost:4005/orders/id
- localhost:4005/orders/find/:userId
- localhost:4005/orders/income

- localhost:4005/product-add
- localhost:4005/products

## Сет-ап проекта
```
docker-compose up --build
```
```
docker-compose down
```

## Стек технологий Backend
- [express](https://expressjs.com/)
- [mongodb](https://www.mongodb.com/)
- [mongoosejs](https://mongoosejs.com/)
- [node.js](https://nodejs.org/ru)
- [jest](https://jestjs.io/)
