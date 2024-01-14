const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const testUser1 = {
    username: 'testuser1',
    password: 'testpassword1',
};

const testUser2 = {
    username: 'testuser',
    password: 'testpassword',
};

beforeAll(async () => {
    jest.setTimeout(60000);

    await User.deleteMany({ username: testUser1.username });
    await User.deleteMany({ username: testUser2.username });

    const hashPassword1 = bcrypt.hashSync(testUser1.password, 7);
    const user1 = new User({
        username: testUser1.username,
        password: hashPassword1,
    });
    await user1.save();

    const hashPassword2 = bcrypt.hashSync(testUser2.password, 7);
    const user2 = new User({
        username: testUser2.username,
        password: hashPassword2,
        roles: ['USER'],
    });
    await user2.save();
});

describe('User Registration', () => {
    beforeEach(async () => {
        await User.deleteMany({ username: testUser1.username });
    });

    it('should log in a user with valid credentials', async () => {
        const response = await request(app)
            .post('/auth/registration')
            .send(testUser1);

        expect(response.status).toBe(201);
        expect(response.body.status).toBe(true);
        expect(response.body.message).toBe('Пользователь успешно зарегистрирован');
    });

    it('should return 409 when user already exists', async () => {
        await User.create({ username: testUser1.username, password: 'hashedPassword' });

        const response = await request(app)
            .post('/auth/registration')
            .send(testUser1);

        expect(response.status).toBe(409);
        expect(response.body.status).toBe(false);
        expect(response.body.error).toBe('Conflict');
    });

    it('should return 401 when password is incorrect', async () => {
        const correctPassword = 'correctpassword';
        await User.create({ username: testUser1.username, password: bcrypt.hashSync(correctPassword, 7) });

        const response = await request(app)
            .post('/auth/registration')
            .send({ username: testUser1.username, password: 'incorrectpassword' });

        expect(response.status).toBe(400);
        expect(response.body.status).toBe(false);
        expect(response.body.error).toBe('Bad Request');
    });
    

    afterAll(async () => {
        await User.findOneAndDelete({ username: testUser1.username });
    });
});

describe('User Login', () => {
    it('should log in a user with valid credentials', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send(testUser2);

        expect(response.status).toBe(200);
        expect(response.body.token).toBeTruthy();
    });

    it('should return 404 when user is not found', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ username: 'nonexistentuser', password: 'testpassword' });

        expect(response.status).toBe(404);
        expect(response.body.status).toBe(false);
        expect(response.body.error).toBe('Not Found');
    });

    it('should return 401 when password is incorrect', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ username: testUser2.username, password: 'incorrectpassword' });

        expect(response.status).toBe(401);
        expect(response.body.status).toBe(false);
        expect(response.body.error).toBe('Unauthorized');
    });

    it('should return 500 when there is a server error', async () => {
        const mockError = jest.fn(() => {
            throw new Error('Mock server error');
        });
        User.findOne = mockError;
        const response = await request(app)
            .post('/auth/login')
            .send(testUser2);

        expect(response.status).toBe(500);
        expect(response.body.status).toBe(false);
        expect(response.body.error).toBe('Internal Server Error');
    });
});

describe('User Access Control', () => {
    it('should get users for admin', async () => {
        const adminToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTViZTkxNzIyNjBhODQ0MjU3YWIyNSIsInJvbGVzIjpbIkFETUlOIl0sImlhdCI6MTY5NzEwNjQwMywiZXhwIjoxNjk3MTkyODAzfQ.BlViXceNsbkgpskUJBrU5Or-UK8YhIN4SOYXBflPW10";

        const response = await request(app)
            .get('/auth/users')
            .set("Authorization", adminToken);

        expect(response.status).toBe(200);
        expect(response.body).toBeTruthy();
    });

    it('should return 403 when access is denied', async () => {
        const response = await request(app)
            .get('/auth/users');

        expect(response.status).toBe(403);
        expect(response.body).toBeTruthy();
    });
});

afterAll(async () => {
    await User.findOneAndDelete({ username: testUser1.username });
    await User.findOneAndDelete({ username: testUser2.username });
});