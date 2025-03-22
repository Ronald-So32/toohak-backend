import request from 'sync-request-curl';
import config from '../src/config.json';

const port = config.port;
const url = config.url;
const serverURL = `${url}:${port}/v1`;
const timeoutMS = 7 * 1000;

beforeEach(() => {
  request(
    'DELETE',
    `${serverURL}/clear'`,
    {
      timeout: timeoutMS
    }
  );
});

// Single GET tests
describe('Test Feature', () => {
  test('Test successful GET request', () => {
    const response = request(
      'GET',
      `${serverURL}/echo`,
      {
        qs: {
          echo: 'Hello',
        },
        timeout: timeoutMS
      }
    );
    const bodyObj = JSON.parse(response.body as string);
    expect(bodyObj.value).toEqual('Hello');
  });

  test('Test unsuccessful GET request', () => {
    const response = request(
      'GET',
      `${serverURL}/echo`,
      {
        qs: {
          echo: 'echo',
        },
        timeout: timeoutMS
      }
    );
    expect(response.statusCode).toStrictEqual(400);
  });








});