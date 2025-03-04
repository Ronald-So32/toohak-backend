import { adminAuthRegister} from './auth.js';

describe('Check correct return types', () => {
  test('Check if the return is an object', () => {
    let result = adminAuthRegister('z1111@ad.unsw.edu.au', '123', 'first', 'last');
    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();
  });

   test('Check if the return object has a userId', () => {
    let result = adminAuthRegister('z1111@ad.unsw.edu.au', '123', 'first', 'last');
    expect(typeof result).toEqual({
      userId: expect.any(Number)
    });
    expect(result).not.toBeNull();
  });

)};


describe('Check error cases', () => {
  test('', () => {

  });

)};


describe('Check normal usage cases', () => {
  test('', () => {

  });

)};


describe('Random normal test cases', () => {
  /*test('', () => {

  });*/
  // TODO: add some random test cases after implementation
)};

