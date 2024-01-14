const request = require('supertest')
const app = require('../index')
// beforeAll(async () => {
//     jest.setTimeout(10000);
// });
describe('GET /orders/find/:userId', () => {
    it('should get orders', async () => {
        
        const response = await request(app)
            .get('/orders/find/6515be9172260a844257ab25')

       expect(response.status).toBe(200);
       expect(response.body).toBeTruthy();
    });
})