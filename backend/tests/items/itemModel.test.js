// tests/features/items/itemModel.test.js
const mongoose = require('mongoose');
const Item = require('../../features/items/itemModel');
const List = require('../../features/lists/listModel');
const User = require('../../features/users/userModel'); // Import User modelu

describe('Item Model', () => {
  let user; // Proměnná pro uživatele

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

  it('should create and save an item successfully', async () => {
    const list = new List({
      title: 'Test List', // Použijte 'title' místo 'name'
      ownerId: user._id,  // Použijte validní ObjectId uživatele
      members: [],
    });
    await list.save();

    const validItem = new Item({
      itemText: 'Test Item',
      listId: list._id,
    });

    const savedItem = await validItem.save();

    expect(savedItem._id).toBeDefined();
    expect(savedItem.itemText).toBe('Test Item');
    expect(savedItem.isResolved).toBe(false);
    expect(savedItem.listId.toString()).toBe(list._id.toString());
    expect(savedItem.createdAt).toBeDefined();
    expect(savedItem.updatedAt).toBeDefined();
  });

  it('should fail to create an item without required fields', async () => {
    const list = new List({
      title: 'Test List',
      ownerId: user._id,
      members: [],
    });
    await list.save();

    const itemWithoutRequiredField = new Item({});
    let err;
    try {
      await itemWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.itemText).toBeDefined();
    expect(err.errors.listId).toBeDefined();
  });

  it('should enforce itemText length constraints', async () => {
    const list = new List({
      title: 'Test List',
      ownerId: user._id,
      members: [],
    });
    await list.save();

    const shortItem = new Item({ itemText: 'a', listId: list._id });
    const longItem = new Item({ itemText: 'a'.repeat(501), listId: list._id });

    // Short item by měl projít
    const savedShortItem = await shortItem.save();
    expect(savedShortItem.itemText).toBe('a');

    // Long item by měl selhat
    let err;
    try {
      await longItem.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.itemText).toBeDefined();
    expect(err.errors.itemText.message).toContain('Path `itemText`');
  });

  it('should have default value for isResolved', async () => {
    const list = new List({
      title: 'Test List',
      ownerId: user._id,
      members: [],
    });
    await list.save();

    const item = new Item({ itemText: 'Default Resolved', listId: list._id });
    const savedItem = await item.save();
    expect(savedItem.isResolved).toBe(false);
  });
});