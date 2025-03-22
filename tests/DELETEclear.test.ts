import {
  requestClear
} from './helper.test'

import request from 'sync-request-curl';
import config from '../src/config.json';
import { describe } from 'node:test';

beforeEach(() => {
  requestClear();
});

describe('Testing /v1/clear', () => {
  test('Testing the return value', () => {
    const response = requestClear();
    expect(response).toStrictEqual({});
    expect(response.statusCode).toStrictEqual(200);
  });

});