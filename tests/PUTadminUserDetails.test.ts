import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestGetUserDetails,
  requestAdminUserDetailsUpdate,
} from './testsHelper';

import { describe } from 'node:test';

const OK = 200;
const BADREQUEST = 400;
const UNAUTHORISED = 401;

let responseRegister: responseInterface;
let session: string;

beforeEach(() => {
  requestClear();
  responseRegister = requestAdminAuthRegister(
    'z7277272@ad.unsw.edu.au',
    'Password1',
    'First',
    'Last'
  );
  session = responseRegister.body.session;
});

describe('Testing PUT /v1/admin/user/details', () => {
  test('Testing the code 200 return value', () => {
    const responseUpdate = requestAdminUserDetailsUpdate(
      session,
      'z69727@ad.unsw.edu.au',
      'Firsttt',
      'Lasttt'
    );
    expect(responseUpdate.body).toStrictEqual({});
    expect(responseUpdate.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    describe('Testing the email', () => {
      test('Session is invalid', () => {
        const responseUpdate = requestAdminUserDetailsUpdate(
          session + "Invalid Session",
          'another@email.com',
          'First',
          'Last'
        );

        expect(responseUpdate.body).toStrictEqual({ error: expect.any(String) });
        expect(responseUpdate.statusCode).toStrictEqual(UNAUTHORISED);
      });

      test('Email is already used by another user', () => {
        requestAdminAuthRegister(
          'another@email.com',
          'Password1',
          'AnotherFirst',
          'AnotherLast'
        );

        // Try to update the first user's email to the second user's email
        const responseUpdate = requestAdminUserDetailsUpdate(
          session,
          'another@email.com',
          'First',
          'Last'
        );
        expect(responseUpdate.body).toStrictEqual({ error: expect.any(String) });
        expect(responseUpdate.statusCode).toStrictEqual(BADREQUEST);
      });

      describe('Invalid email formats', () => {
        test.each([
          {
            description: 'Missing username for domain',
            email: 'emailemail.com',
          },
          {
            description: 'Missing domain',
            email: 'invalid-email',
          },
          {
            description: 'Missing username before domain',
            email: '@missingusername.com',
          },
          {
            description: 'Missing domain name',
            email: 'user@.com',
          },
        ])('Invalid email format - $description', ({ email }) => {
          const responseUpdate = requestAdminUserDetailsUpdate(
            session,
            email,
            'First',
            'Last'
          );
          expect(responseUpdate.body).toStrictEqual({ error: expect.any(String) });
          expect(responseUpdate.statusCode).toStrictEqual(BADREQUEST);

          const responseUserDetails = requestGetUserDetails(session);
          expect(responseUserDetails.body).toStrictEqual({
            user: {
              userId: expect.any(Number),
              name: 'First Last',
              email: 'z7277272@ad.unsw.edu.au',
              numSuccessfulLogins: 1,
              numFailedPasswordsSinceLastLogin: 0
            }
          });
          expect(responseUserDetails.statusCode).toStrictEqual(OK);
        });
      });

      test('Valid email format', () => {
        const responseUpdate = requestAdminUserDetailsUpdate(
          session,
          'valid@email.com',
          'First',
          'Last'
        );
        expect(responseUpdate.body).toStrictEqual({});
        expect(responseUpdate.statusCode).toStrictEqual(OK);

        const responseUserDetails = requestGetUserDetails(session);
        expect(responseUserDetails.body).toStrictEqual({
          user: {
            userId: expect.any(Number),
            name: 'First Last',
            email: 'valid@email.com',
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0
          }
        });
        expect(responseUserDetails.statusCode).toStrictEqual(OK);
      });
    });
    
    describe('Testing the first name', () => {
      describe('Invalid cases', () => {
        test.each([
          {
            description: 'Contains invalid characters',
            nameFirst: 'First@123',
          },
          {
            description: 'Too short (1 character)',
            nameFirst: 'F',
          },
          {
            description: 'Too long (more than 20 characters)',
            nameFirst: 'ThisFirstNameIsWayTooLongAndShouldFailValidation',
          },
        ])('Invalid first name - $description', ({ nameFirst }) => {
          const responseUpdate = requestAdminUserDetailsUpdate(
            session,
            'email@email.com',
            nameFirst,
            'Last'
          );
          expect(responseUpdate.body).toStrictEqual({ error: expect.any(String) });
          expect(responseUpdate.statusCode).toStrictEqual(BADREQUEST);
        });
  
      });
      describe('Valid cases', () => {
        test.each([
          {
            description: 'Standard first name',
            nameFirst: 'First',
          },
          {
            description: 'First name with space',
            nameFirst: 'Fi rst',
          },
          {
            description: 'First name with apostrophe',
            nameFirst: "Fi'rst",
          },
          {
            description: 'First name with hyphen',
            nameFirst: 'Fi-rst',
          },
          {
            description: 'First name with exactly 2 characters',
            nameFirst: 'Fi',
          },
          {
            description: 'First name with exactly 20 characters',
            nameFirst: 'Firstfirstfirstfirst',
          },
        ])('Valid first name - $description', ({ nameFirst }) => {
          const responseUpdate = requestAdminUserDetailsUpdate(
            session,
            'email@email.com',
            nameFirst,
            'Last'
          );
          expect(responseUpdate.body).toStrictEqual({});
          expect(responseUpdate.statusCode).toStrictEqual(OK);
        });
      });
    });

    describe('Testing the last name', () => {
      describe('Invalid cases', () => {
        test.each([
          {
            description: 'Contains invalid characters',
            nameLast: 'Last@123',
          },
          {
            description: 'Too short (1 character)',
            nameLast: 'L',
          },
          {
            description: 'Too long (more than 20 characters)',
            nameLast: 'ThisLastNameIsWayTooLongAndShouldFailValidation',
          },
        ])('Invalid last name - $description', ({ nameLast }) => {
          const responseUpdate = requestAdminUserDetailsUpdate(
            session,
            'email@email.com',
            'First',
            nameLast
          );
          expect(responseUpdate.body).toStrictEqual({ error: expect.any(String) });
          expect(responseUpdate.statusCode).toStrictEqual(BADREQUEST);
        });
      });

      describe('Valid cases', () => {
        test.each([
          {
            description: 'Standard last name',
            nameLast: 'Last',
          },
          {
            description: 'Last name with space',
            nameLast: 'La st',
          },
          {
            description: 'Last name with apostrophe',
            nameLast: "La'st",
          },
          {
            description: 'Last name with hyphen',
            nameLast: 'La-st',
          },
          {
            description: 'Last name with exactly 2 characters',
            nameLast: 'La',
          },
          {
            description: 'Last name with exactly 20 characters',
            nameLast: 'Lastlastlastlastlast',
          },
        ])('Valid last name - $description', ({ nameLast }) => {
          const responseUpdate = requestAdminUserDetailsUpdate(
            session,
            'email@email.com',
            'First',
            nameLast
          );
          expect(responseUpdate.body).toStrictEqual({});
          expect(responseUpdate.statusCode).toStrictEqual(OK);
        });
      });
    });
  });

  describe('Testing PUT /v1/admin/user/details works as intended', () => {
    test.each([
      {
        description: "No changes made to user's details",
        email: 'z7277272@ad.unsw.edu.au',
        nameFirst: 'First',
        nameLast: 'Last',
      },
      {
        description: "Changes made to user's email",
        email: 'Email2@ad.unsw.edu.au',
        nameFirst: 'First',
        nameLast: 'Last',
      },
      {
        description: "Changes made to user's first name",
        email: 'z7277272@ad.unsw.edu.au',
        nameFirst: 'Second',
        nameLast: 'Last',
      },
      {
        description: "Changes made to user's last name",
        email: 'z7277272@ad.unsw.edu.au',
        nameFirst: 'First',
        nameLast: 'SecondLast',
      },
      {
        description: "Changes made to user's email and first name",
        email: 'Email@ad.unsw.edu.au',
        nameFirst: 'Second',
        nameLast: 'Last',
      },
      {
        description: "Changes made to user's email and last name",
        email: 'Email@ad.unsw.edu.au',
        nameFirst: 'First',
        nameLast: 'SecondLast',
      },
      {
        description: "Changes made to user's first and last name",
        email: 'z7277272@ad.unsw.edu.au',
        nameFirst: 'Second',
        nameLast: 'SecondLast',
      },
      {
        description: "Changes made to all of user's details",
        email: 'Email@ad.unsw.edu.au',
        nameFirst: 'Second',
        nameLast: 'SecondLast',
      },
    ])('$description', ({ email, nameFirst, nameLast }) => {
      const responseUpdate = requestAdminUserDetailsUpdate(
        session,
        email,
        nameFirst,
        nameLast
      );
  
      expect(responseUpdate.body).toStrictEqual({});
      expect(responseUpdate.statusCode).toStrictEqual(OK);
  
      const responseDetails = requestGetUserDetails(session);
  
      expect(responseDetails.body).toStrictEqual({
        user: {
          userId: expect.any(Number),
          name: `${nameFirst} ${nameLast}`,
          email: email,
          numSuccessfulLogins: 1,
          numFailedPasswordsSinceLastLogin: 0,
        },
      });
    });
  });
});
