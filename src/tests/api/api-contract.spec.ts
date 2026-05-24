import { test, expect } from '@playwright/test';
import * as http from 'http';
import { AddressInfo } from 'net';
import { Logger } from '../../utils/Logger';

test.describe('API Contract & Integration Testing - Local Mock REST API', () => {
  let server: http.Server;
  let port: number;

  // Schema interface representing standard user objects
  interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    avatar: string;
  }

  /**
   * Custom Contract Validator checking matching types.
   * Demonstrates strict vanilla TypeScript schema verification.
   */
  function validateUserSchema(user: any): user is User {
    return (
      typeof user.id === 'number' &&
      typeof user.email === 'string' &&
      typeof user.first_name === 'string' &&
      typeof user.last_name === 'string' &&
      typeof user.avatar === 'string'
    );
  }

  // Spin up a local lightweight mock server before running the API tests
  test.beforeAll(async () => {
    Logger.info('Starting local mock REST API server...');
    server = http.createServer((req, res) => {
      res.setHeader('Content-Type', 'application/json');

      if (req.url?.startsWith('/api/users')) {
        if (req.method === 'GET') {
          res.writeHead(200);
          res.end(
            JSON.stringify({
              page: 2,
              data: [
                {
                  id: 7,
                  email: 'michael.lawson@reqres.in',
                  first_name: 'Michael',
                  last_name: 'Lawson',
                  avatar: 'https://reqres.in/img/faces/7-image.jpg'
                }
              ]
            })
          );
        } else if (req.method === 'POST') {
          res.writeHead(201);
          res.end(
            JSON.stringify({
              name: 'SDET Candidate',
              job: 'Principal QA Engineer',
              id: '100',
              createdAt: new Date().toISOString()
            })
          );
        } else if (req.method === 'PUT') {
          res.writeHead(200);
          res.end(
            JSON.stringify({
              name: 'E2E Expert',
              job: 'Director of QA Automation',
              updatedAt: new Date().toISOString()
            })
          );
        } else if (req.method === 'DELETE') {
          res.writeHead(204);
          res.end();
        }
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not Found' }));
      }
    });

    // Listen to Port 0 (OS will automatically allocate any free ephemeral port, preventing conflicts)
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const address = server.address() as AddressInfo;
    port = address.port;
    Logger.info(`Local mock REST API server running dynamically on http://localhost:${port}`);
  });

  // Tear down mock server after completing the tests
  test.afterAll(async () => {
    Logger.info('Stopping local mock REST API server...');
    await new Promise<void>((resolve) => server.close(() => resolve()));
    Logger.info('Local mock REST API server stopped.');
  });

  test('GET /api/users - Should return list of users and match schema contracts', async ({ request }) => {
    Logger.testStep('API GET List Validation');

    // Make GET request to the local mock server
    Logger.info(`Sending GET request to "http://localhost:${port}/api/users?page=2"`);
    const response = await request.get(`http://localhost:${port}/api/users`, {
      params: { page: 2 }
    });

    // Assert status code is 200 OK
    expect(response.status()).toBe(200);
    Logger.info(`Response Status verified: ${response.status()}`);

    // Parse JSON payload
    const responseBody = await response.json();
    expect(responseBody.page).toBe(2);
    expect(Array.isArray(responseBody.data)).toBe(true);
    expect(responseBody.data.length).toBeGreaterThan(0);

    // Validate schema contract for each user object in data array
    Logger.info('Validating JSON contract schema for retrieved users...');
    for (const user of responseBody.data) {
      const isValid = validateUserSchema(user);
      if (!isValid) {
        Logger.error(`Schema Contract mismatch detected on user details: ${JSON.stringify(user)}`);
        throw new Error('API JSON Schema Contract Validation Failed!');
      }
    }
    
    Logger.info(`Schema contracts matched perfectly for all ${responseBody.data.length} users.`);
  });

  test('POST /api/users - Should create new user and return details', async ({ request }) => {
    Logger.testStep('API POST Create Validation');

    const newUserPayload = {
      name: 'SDET Candidate',
      job: 'Principal QA Engineer'
    };

    Logger.info(`Sending POST request with payload: ${JSON.stringify(newUserPayload)}`);
    const response = await request.post(`http://localhost:${port}/api/users`, {
      data: newUserPayload
    });

    // Assert status is 201 Created
    expect(response.status()).toBe(201);
    
    const responseBody = await response.json();
    expect(responseBody.name).toBe(newUserPayload.name);
    expect(responseBody.job).toBe(newUserPayload.job);
    expect(responseBody.id).toBeDefined();
    expect(responseBody.createdAt).toBeDefined();

    Logger.info(`User created successfully with generated ID: ${responseBody.id}`);
  });

  test('PUT /api/users/:id - Should update existing user details', async ({ request }) => {
    Logger.testStep('API PUT Update Validation');

    const updatePayload = {
      name: 'E2E Expert',
      job: 'Director of QA Automation'
    };

    Logger.info(`Sending PUT request to update user "2" with payload: ${JSON.stringify(updatePayload)}`);
    const response = await request.put(`http://localhost:${port}/api/users/2`, {
      data: updatePayload
    });

    // Assert status is 200 OK
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.name).toBe(updatePayload.name);
    expect(responseBody.job).toBe(updatePayload.job);
    expect(responseBody.updatedAt).toBeDefined();

    Logger.info(`User details updated successfully at: ${responseBody.updatedAt}`);
  });

  test('DELETE /api/users/:id - Should delete user and return 204 status', async ({ request }) => {
    Logger.testStep('API DELETE Request Validation');

    Logger.info('Sending DELETE request to "/api/users/2"');
    const response = await request.delete(`http://localhost:${port}/api/users/2`);

    // Assert status is 204 No Content (standard deletion success status)
    expect(response.status()).toBe(204);
    Logger.info('DELETE request successfully verified with HTTP 204.');
  });
});
