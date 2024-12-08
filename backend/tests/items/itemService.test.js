// tests/features/items/itemService.test.js
const mongoose = require('mongoose');
const List = require('../../features/lists/listModel');
const User = require('../../features/users/userModel');
const Item = require('../../features/items/itemModel');
const itemService = require('../../features/items/itemService');
const { AppError } = require('../../middleware/errorHandler');

describe('Item Service', () => {
  let user;
  let list;

  beforeEach(async () => {
    // Vytvoření uživatele pro testování
    user = await User.create({
      email: 'testuser@example.com',
      username: 'testuser',
      password: 'password123',
    });

    // Vytvoření seznamu pro testování
    list = await List.create({
      ownerId: user._id,
      title: 'Test List',
      members: [user._id],
      items: [],
    });
  });

  describe('addItemToList', () => {
    it('should add a new item to the list successfully', async () => {
      const itemText = 'Test Item';

      const item = await itemService.addItemToList(list._id, itemText);

      expect(item).toBeDefined();
      expect(item.itemText).toBe(itemText);
      expect(item.listId._id.toString()).toBe(list._id.toString()); // Opraveno: Přístup k _id
      expect(item.isResolved).toBe(false);

      // Ověření, že položka byla přidána do seznamu
      const updatedList = await List.findById(list._id).populate('items');
      expect(updatedList.items.length).toBe(1);
      expect(updatedList.items[0]._id.toString()).toBe(item._id.toString());
    });

    it('should throw an error if the list does not exist', async () => {
      const invalidListId = new mongoose.Types.ObjectId();
      const itemText = 'Invalid Item';

      await expect(itemService.addItemToList(invalidListId, itemText)).rejects.toThrow(AppError);
      await expect(itemService.addItemToList(invalidListId, itemText)).rejects.toThrow('List not found.');
    });

    it('should throw an error if itemText is not provided', async () => {
      const itemText = '';

      // Předpokládáme, že validace je provedena před voláním služby
      // Pokud validace není provedena ve službě, tato test může selhat
      await expect(itemService.addItemToList(list._id, itemText)).rejects.toThrow(); // Můžete specifikovat konkrétní chybovou zprávu
    });
  });

  describe('getItems', () => {
    beforeEach(async () => {
      // Přidání několika položek do seznamu
      await itemService.addItemToList(list._id, 'Item 1');
      await itemService.addItemToList(list._id, 'Item 2');
      const item3 = await itemService.addItemToList(list._id, 'Item 3');
      // Markování jedné položky jako resolved
      await itemService.markItemResolved(list._id, item3._id, true);
    });

    it('should retrieve all items from the list', async () => {
      const items = await itemService.getItems(list._id, undefined);

      expect(items.length).toBe(3);
      expect(items[0].itemText).toBe('Item 2'); // Správné pořadí podle sort { isResolved: 1, createdAt: -1 }
      expect(items[1].itemText).toBe('Item 1');
      expect(items[2].itemText).toBe('Item 3');
    });

    it('should retrieve only resolved items', async () => {
      const items = await itemService.getItems(list._id, 'resolved');

      expect(items.length).toBe(1);
      expect(items[0].itemText).toBe('Item 3');
      expect(items[0].isResolved).toBe(true);
    });

    it('should retrieve only unresolved items', async () => {
      const items = await itemService.getItems(list._id, 'unresolved');

      expect(items.length).toBe(2);
      expect(items[0].isResolved).toBe(false);
      expect(items[1].isResolved).toBe(false);
    });

    it('should throw an error for invalid status filter', async () => {
      const invalidStatus = 'invalidStatus';

      await expect(itemService.getItems(list._id, invalidStatus)).rejects.toThrow(AppError);
      await expect(itemService.getItems(list._id, invalidStatus)).rejects.toThrow('Invalid status filter.');
    });

    it('should return an empty array if the list has no items', async () => {
      // Vytvoření nového seznamu bez položek
      const newList = await List.create({
        ownerId: user._id,
        title: 'Empty List',
        members: [user._id],
        items: [],
      });

      const items = await itemService.getItems(newList._id, undefined);

      expect(items.length).toBe(0);
    });

    it('should return an empty array if the list does not exist', async () => {
      const invalidListId = new mongoose.Types.ObjectId();

      const items = await itemService.getItems(invalidListId, undefined);

      expect(items.length).toBe(0);
    });
  });

  describe('markItemResolved', () => {
    let item;

    beforeEach(async () => {
      item = await itemService.addItemToList(list._id, 'Item to Resolve');
    });

    it('should mark an item as resolved successfully', async () => {
      const updatedItem = await itemService.markItemResolved(list._id, item._id, true);

      expect(updatedItem.isResolved).toBe(true);

      const foundItem = await Item.findById(item._id);
      expect(foundItem.isResolved).toBe(true);
    });

    it('should mark an item as unresolved successfully', async () => {
      // Nejprve označíme položku jako resolved
      await itemService.markItemResolved(list._id, item._id, true);

      // Poté ji odznačíme
      const updatedItem = await itemService.markItemResolved(list._id, item._id, false);

      expect(updatedItem.isResolved).toBe(false);

      const foundItem = await Item.findById(item._id);
      expect(foundItem.isResolved).toBe(false);
    });

    it('should throw an error if the item does not exist', async () => {
      const invalidItemId = new mongoose.Types.ObjectId();
      const isResolved = true;

      await expect(itemService.markItemResolved(list._id, invalidItemId, isResolved)).rejects.toThrow(AppError);
      await expect(itemService.markItemResolved(list._id, invalidItemId, isResolved)).rejects.toThrow('Item not found.');
    });

    it('should throw an error if the list does not exist', async () => {
      const invalidListId = new mongoose.Types.ObjectId();
      const isResolved = true;

      await expect(itemService.markItemResolved(invalidListId, item._id, isResolved)).rejects.toThrow(AppError);
      await expect(itemService.markItemResolved(invalidListId, item._id, isResolved)).rejects.toThrow('Item not found.');
    });
  });

  describe('deleteItemFromList', () => {
    let item;

    beforeEach(async () => {
      item = await itemService.addItemToList(list._id, 'Item to Delete');
    });

    it('should delete an item from the list successfully', async () => {
      const deletedItem = await itemService.deleteItemFromList(list._id, item._id);

      expect(deletedItem).toBeDefined();
      expect(deletedItem._id.toString()).toBe(item._id.toString());

      // Ověření, že položka byla odstraněna ze seznamu
      const updatedList = await List.findById(list._id).populate('items');
      expect(updatedList.items.length).toBe(0);

      // Ověření, že položka byla odstraněna z databáze
      const foundItem = await Item.findById(item._id);
      expect(foundItem).toBeNull();
    });

    it('should throw an error if the item does not exist', async () => {
      const invalidItemId = new mongoose.Types.ObjectId();

      await expect(itemService.deleteItemFromList(list._id, invalidItemId)).rejects.toThrow(AppError);
      await expect(itemService.deleteItemFromList(list._id, invalidItemId)).rejects.toThrow('Item not found.');
    });

    it('should throw an error if the list does not exist', async () => {
      const invalidListId = new mongoose.Types.ObjectId();

      await expect(itemService.deleteItemFromList(invalidListId, item._id)).rejects.toThrow(AppError);
      await expect(itemService.deleteItemFromList(invalidListId, item._id)).rejects.toThrow('List not found.');
    });

    it('should throw an error if the item does not belong to the list', async () => {
      // Vytvoření jiné položky v jiném seznamu
      const otherList = await List.create({
        ownerId: user._id,
        title: 'Other List',
        members: [user._id],
        items: [],
      });
      const otherItem = await itemService.addItemToList(otherList._id, 'Other Item');

      // Pokus o smazání položky z původního seznamu
      await expect(itemService.deleteItemFromList(list._id, otherItem._id)).rejects.toThrow(AppError);
      await expect(itemService.deleteItemFromList(list._id, otherItem._id)).rejects.toThrow('Item not found.');
    });
  });
});