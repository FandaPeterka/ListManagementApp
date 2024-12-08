// tests/features/lists/listModel.test.js
const mongoose = require('mongoose');
const List = require('../../features/lists/listModel');
const User = require('../../features/users/userModel');

describe('List Model', () => {
  let user;

  beforeAll(async () => {
    // Vytvoření uživatele pro validní ownerId
    user = new User({
      email: 'testuser@example.com',
      username: 'testuser',
      password: 'password123',
    });
    await user.save();
  });

  // Odstraněn afterAll, protože jest.setup.js se stará o zavření připojení

  it('should create and save a list successfully', async () => {
    const listData = {
      ownerId: user._id,
      title: 'Test List',
      isArchived: false,
      members: [],
      items: [],
      deletedAt: null,
    };

    const validList = new List(listData);
    const savedList = await validList.save();

    expect(savedList._id).toBeDefined();
    expect(savedList.ownerId.toString()).toBe(user._id.toString());
    expect(savedList.title).toBe('Test List');
    expect(savedList.isArchived).toBe(false);
    expect(savedList.members).toEqual([]);
    expect(savedList.items).toEqual([]);
    expect(savedList.deletedAt).toBeNull();
    expect(savedList.createdAt).toBeDefined();
    expect(savedList.updatedAt).toBeDefined();
  });

  it('should fail to create a list without required fields', async () => {
    const listWithoutRequiredField = new List({});
    let err;
    try {
      await listWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.ownerId).toBeDefined();
    expect(err.errors.title).toBeDefined();
  });

  it('should enforce title length constraints', async () => {
    const shortTitleList = new List({
      ownerId: user._id,
      title: 'a',
      members: [],
      items: [],
    });
    const longTitleList = new List({
      ownerId: user._id,
      title: 'a'.repeat(256),
      members: [],
      items: [],
    });

    // Krátký název by měl projít
    const savedShortTitleList = await shortTitleList.save();
    expect(savedShortTitleList.title).toBe('a');

    // Dlouhý název by měl selhat
    let err;
    try {
      await longTitleList.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.title).toBeDefined();
    expect(err.errors.title.message).toContain('Title must not exceed 255 characters');
  });

  it('should have default value for isArchived', async () => {
    const list = new List({
      ownerId: user._id,
      title: 'Archived Test List',
      members: [],
      items: [],
    });
    const savedList = await list.save();
    expect(savedList.isArchived).toBe(false);
  });
});