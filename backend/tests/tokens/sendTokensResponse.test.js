// tests/features/tokens/sendTokensResponse.test.js
const sendTokensResponse = require('../../features/tokens/sendTokensResponse');

jest.mock('../../middleware/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('Send Tokens Response', () => {
  let res, user, next;

  beforeEach(() => {
    res = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    user = {
      _id: 'user-id',
      email: 'user@example.com',
      username: 'testuser',
      profilePicture: 'profile.jpg',
      bio: 'User bio',
      status: 'active',
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should set cookies and send user data', async () => {
    await sendTokensResponse(res, user, 'access-token', 'refresh-token', 200, next);

    expect(res.cookie).toHaveBeenCalledTimes(2);
    expect(res.cookie).toHaveBeenCalledWith('accessToken', 'access-token', expect.any(Object));
    expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'refresh-token', expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: { user: expect.any(Object) },
    });
  });

  it('should handle errors and call next with error', async () => {
    res.cookie.mockImplementation(() => {
      throw new Error('Cookie error');
    });

    await sendTokensResponse(res, user, 'access-token', 'refresh-token', 200, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Failed to send tokens.');
  });
});