const request = require('supertest');
const server = require('./server.js');
const db = require('../database/dbConfig');

beforeEach(async () => {
    await db('users').truncate();
});

describe('server.js', () => {
    describe('GET /api/jokes', () => {
        it('should return 400 without auth', async () => {
            const response = await request(server).get('/api/jokes');

            expect(response.status).toEqual(400);
        });

        it('should return 200 with auth', async () => {
            await request(server).post('/api/auth/register').send({username: 'test', password: 'test'});
            const login = await request(server).post('/api/auth/login').send({username: 'test', password: 'test'});
            const response = await request(server).get('/api/jokes').set({Authorization: login.body.token});

            expect(response.status).toEqual(200);
        });
    });


    describe('POST /api/register', () => {
        it('should return 201 on user create', async () => {
            const response = await request(server).post('/api/auth/register').send({username: 'test', password: 'test'});

            expect(response.status).toEqual(201);
        });

        it('should return 500 on dupe user', async () => {
            await request(server).post('/api/auth/register').send({username: 'test', password: 'test'});
            const response = await request(server).post('/api/auth/register').send({username: 'test', password: 'test'});

            expect(response.status).toEqual(500);
        });
    });

    describe('POST /api/login', () => {
        it('should return 200 non existing user', async () => {
            await request(server).post('/api/auth/register').send({username: 'test', password: 'test'});
            const response = await request(server).post('/api/auth/login').send({username: 'test', password: 'test'});

            expect(response.status).toEqual(200);
        });

        it('should return 400 on non existing user', async () => {
            const response = await request(server).post('/api/auth/login').send({username: 'test', password: 'test'});

            expect(response.status).toEqual(401);
        });
    });
});
