// tests/features/lists/listService.test.js
const mongoose = require('mongoose');
const List = require('../../features/lists/listModel');
const User = require('../../features/users/userModel');
const Item = require('../../features/items/itemModel');
const listService = require('../../features/lists/listService');
const { AppError } = require('../../middleware/errorHandler');

describe('List Service', () => {
  let user;

  beforeEach(async () => {
    // Vytvoření uživatele pro testování
    user = await User.create({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    });
  });

  describe('createList', () => {
    it('should create a new list successfully', async () => {
      const title = 'Test List';

      const list = await listService.createList(user._id, title);

      expect(list).toBeDefined();
      expect(list.title).toBe(title);
      expect(list.ownerId._id.toString()).toBe(user._id.toString());
      expect(list.members.length).toBe(1);
      expect(list.members[0]._id.toString()).toBe(user._id.toString());

      // Ověření, že seznam byl uložen v databázi
      const foundList = await List.findById(list._id).populate('ownerId').populate('members').populate('items');
      expect(foundList).toBeDefined();
      expect(foundList.title).toBe(title);
    });

    it('should throw an error if owner does not exist', async () => {
      const invalidUserId = new mongoose.Types.ObjectId(); // Opraveno zde
      const title = 'Invalid List';

      await expect(listService.createList(invalidUserId, title)).rejects.toThrow(AppError);
      await expect(listService.createList(invalidUserId, title)).rejects.toThrow('Owner does not exist.');
    });
  });

  describe('getLists', () => {
    beforeEach(async () => {
      // Vytvoření několika seznamů pro testování
      await listService.createList(user._id, 'Active List 1');
      await listService.createList(user._id, 'Active List 2');
      const archivedList = await listService.createList(user._id, 'Archived List');
      archivedList.isArchived = true;
      await archivedList.save();
      const deletedList = await listService.createList(user._id, 'Deleted List');
      deletedList.deletedAt = new Date();
      await deletedList.save();
    });

    it('should retrieve all active lists for a user', async () => {
      const { lists, total } = await listService.getLists(user._id, 'all', 1, 10);

      expect(lists.length).toBe(3); // Active List 1, Active List 2, Archived List
      expect(total).toBe(3);
    });

    it('should retrieve only active (not archived, not deleted) lists', async () => {
      const { lists, total } = await listService.getLists(user._id, 'active', 1, 10);

      expect(lists.length).toBe(2); // Active List 1, Active List 2
      expect(total).toBe(2);
    });

    it('should retrieve only archived lists owned by the user', async () => {
      const { lists, total } = await listService.getLists(user._id, 'archived', 1, 10);

      expect(lists.length).toBe(1); // Archived List
      expect(total).toBe(1);
      expect(lists[0].isArchived).toBe(true);
    });

    it('should retrieve only deleted lists owned by the user', async () => {
      const { lists, total } = await listService.getLists(user._id, 'deleted', 1, 10);

      expect(lists.length).toBe(1); // Deleted List
      expect(total).toBe(1);
      expect(lists[0].deletedAt).not.toBeNull();
    });

    it('should apply pagination correctly', async () => {
      const { lists, total } = await listService.getLists(user._id, 'all', 1, 2);

      expect(lists.length).toBe(2);
      expect(total).toBe(3);
    });

    it('should handle invalid filter type by defaulting to "all"', async () => {
      const invalidType = 'unknown';

      const { lists, total } = await listService.getLists(user._id, invalidType, 1, 10);

      expect(lists.length).toBe(3); // Active List 1, Active List 2, Archived List
      expect(total).toBe(3);
    });
  });

  describe('getListById', () => {
    it('should retrieve a list by ID', async () => {
      const list = await listService.createList(user._id, 'Specific List');

      const foundList = await listService.getListById(list._id, user._id);

      expect(foundList).toBeDefined();
      expect(foundList.title).toBe('Specific List');
      expect(foundList.ownerId._id.toString()).toBe(user._id.toString());
    });

    it('should throw an error if list does not exist', async () => {
      const invalidListId = new mongoose.Types.ObjectId(); // Opraveno zde

      await expect(listService.getListById(invalidListId, user._id)).rejects.toThrow(AppError);
      await expect(listService.getListById(invalidListId, user._id)).rejects.toThrow('List not found or access denied.');
    });

    it('should throw an error if user is not a member of the list', async () => {
      const otherUser = await User.create({
        email: 'other@example.com',
        username: 'otheruser',
        password: 'password123',
      });

      const list = await listService.createList(user._id, 'Private List');

      await expect(listService.getListById(list._id, otherUser._id)).rejects.toThrow(AppError);
      await expect(listService.getListById(list._id, otherUser._id)).rejects.toThrow('List not found or access denied.');
    });

    it('should throw an error if list is deleted', async () => {
      const list = await listService.createList(user._id, 'Deleted List');
      list.deletedAt = new Date();
      await list.save();

      await expect(listService.getListById(list._id, user._id)).rejects.toThrow(AppError);
      await expect(listService.getListById(list._id, user._id)).rejects.toThrow('List not found or access denied.');
    });
  });

  describe('updateListName', () => {
    it('should update the name of a list successfully', async () => {
      const list = await listService.createList(user._id, 'Old Title');

      const updatedList = await listService.updateListName(list._id, 'New Title');

      expect(updatedList.title).toBe('New Title');

      const foundList = await List.findById(list._id);
      expect(foundList.title).toBe('New Title');
    });

    it('should throw an error if list does not exist', async () => {
      const invalidListId = new mongoose.Types.ObjectId(); // Opraveno zde
      const newTitle = 'New Title';

      await expect(listService.updateListName(invalidListId, newTitle)).rejects.toThrow(AppError);
      await expect(listService.updateListName(invalidListId, newTitle)).rejects.toThrow('List not found.');
    });
  });

  describe('deleteList', () => {
    it('should soft delete a list successfully', async () => {
      const list = await listService.createList(user._id, 'List to Delete');

      const deletedList = await listService.deleteList(list._id);

      expect(deletedList.deletedAt).not.toBeNull();

      const foundList = await List.findById(list._id);
      expect(foundList.deletedAt).not.toBeNull();
    });

    it('should throw an error if list does not exist', async () => {
      const invalidListId = new mongoose.Types.ObjectId(); // Opraveno zde

      await expect(listService.deleteList(invalidListId)).rejects.toThrow(AppError);
      await expect(listService.deleteList(invalidListId)).rejects.toThrow('List not found.');
    });
  });

  describe('restoreDeletedList', () => {
    it('should restore a soft-deleted list successfully', async () => {
      const list = await listService.createList(user._id, 'List to Restore');
      list.deletedAt = new Date();
      await list.save();

      const restoredList = await listService.restoreDeletedList(list._id);

      expect(restoredList.deletedAt).toBeNull();

      const foundList = await List.findById(list._id);
      expect(foundList.deletedAt).toBeNull();
    });

    it('should throw an error if list does not exist', async () => {
      const invalidListId = new mongoose.Types.ObjectId(); // Opraveno zde

      await expect(listService.restoreDeletedList(invalidListId)).rejects.toThrow(AppError);
      await expect(listService.restoreDeletedList(invalidListId)).rejects.toThrow('List not found.');
    });
  });

  describe('archiveList', () => {
    it('should archive a list successfully', async () => {
      const list = await listService.createList(user._id, 'List to Archive');

      const archivedList = await listService.archiveList(list._id);

      expect(archivedList.isArchived).toBe(true);

      const foundList = await List.findById(list._id);
      expect(foundList.isArchived).toBe(true);
    });

    it('should throw an error if list does not exist', async () => {
      const invalidListId = new mongoose.Types.ObjectId(); // Opraveno zde

      await expect(listService.archiveList(invalidListId)).rejects.toThrow(AppError);
      await expect(listService.archiveList(invalidListId)).rejects.toThrow('List not found.');
    });
  });

  describe('restoreArchivedList', () => {
    it('should restore an archived list successfully', async () => {
      const list = await listService.createList(user._id, 'List to Restore Archive');
      list.isArchived = true;
      await list.save();

      const restoredList = await listService.restoreArchivedList(list._id);

      expect(restoredList.isArchived).toBe(false);

      const foundList = await List.findById(list._id);
      expect(foundList.isArchived).toBe(false);
    });

    it('should throw an error if list does not exist', async () => {
      const invalidListId = new mongoose.Types.ObjectId(); // Opraveno zde

      await expect(listService.restoreArchivedList(invalidListId)).rejects.toThrow(AppError);
      await expect(listService.restoreArchivedList(invalidListId)).rejects.toThrow('List not found.');
    });
  });

  describe('getMembers', () => {
    it('should retrieve members of a list successfully', async () => {
      const list = await listService.createList(user._id, 'List with Members');
      const member = await User.create({
        email: 'member@example.com',
        username: 'memberuser',
        password: 'password123',
      });
      list.members.push(member._id);
      await list.save();

      const members = await listService.getMembers(list._id);

      expect(members.length).toBe(2); // owner + one member
      const memberIds = members.map(m => m._id.toString());
      expect(memberIds).toContain(user._id.toString());
      expect(memberIds).toContain(member._id.toString());
    });

    it('should throw an error if list does not exist', async () => {
      const invalidListId = new mongoose.Types.ObjectId(); // Opraveno zde

      await expect(listService.getMembers(invalidListId)).rejects.toThrow(AppError);
      await expect(listService.getMembers(invalidListId)).rejects.toThrow('List not found.');
    });
  });

  describe('addMember', () => {
    it('should add a new member to the list successfully', async () => {
      const list = await listService.createList(user._id, 'List to Add Member');
      const newMember = await User.create({
        email: 'newmember@example.com',
        username: 'newmember',
        password: 'password123',
      });

      const updatedList = await listService.addMember(list._id, newMember.username);

      expect(updatedList.members.length).toBe(2);
      const memberIds = updatedList.members.map(m => m._id.toString()); // Opraveno zde
      expect(memberIds).toContain(user._id.toString());
      expect(memberIds).toContain(newMember._id.toString());

      // Ověření v databázi
      const foundList = await List.findById(list._id);
      expect(foundList.members.length).toBe(2);
      expect(foundList.members).toContainEqual(newMember._id);
    });

    it('should throw an error if user to add does not exist', async () => {
      const list = await listService.createList(user._id, 'List with No Member');
      const nonExistentUsername = 'ghostuser';

      await expect(listService.addMember(list._id, nonExistentUsername)).rejects.toThrow(AppError);
      await expect(listService.addMember(list._id, nonExistentUsername)).rejects.toThrow('User not found.');
    });

    it('should throw an error if list does not exist', async () => {
      const invalidListId = new mongoose.Types.ObjectId(); // Opraveno zde
      const username = 'testuser';

      await expect(listService.addMember(invalidListId, username)).rejects.toThrow(AppError);
      await expect(listService.addMember(invalidListId, username)).rejects.toThrow('List not found.');
    });

    it('should throw an error if user is already a member of the list', async () => {
      const list = await listService.createList(user._id, 'List with Existing Member');

      await expect(listService.addMember(list._id, user.username)).rejects.toThrow(AppError);
      await expect(listService.addMember(list._id, user.username)).rejects.toThrow('User is already a member of the list.');
    });
  });

  describe('removeMember', () => {
    it('should remove a member from the list successfully', async () => {
      const list = await listService.createList(user._id, 'List to Remove Member');
      const member = await User.create({
        email: 'member2@example.com',
        username: 'member2',
        password: 'password123',
      });
      list.members.push(member._id);
      await list.save();

      const updatedList = await listService.removeMember(list._id, member._id);

      expect(updatedList.members.length).toBe(1);
      expect(updatedList.members[0]._id.toString()).toBe(user._id.toString()); // Opraveno zde

      // Ověření v databázi
      const foundList = await List.findById(list._id);
      expect(foundList.members.length).toBe(1);
      expect(foundList.members).not.toContainEqual(member._id);
    });

    it('should throw an error if list does not exist', async () => {
      const invalidListId = new mongoose.Types.ObjectId(); // Opraveno zde
      const memberId = user._id;

      await expect(listService.removeMember(invalidListId, memberId)).rejects.toThrow(AppError);
      await expect(listService.removeMember(invalidListId, memberId)).rejects.toThrow('List not found.');
    });

    it('should throw an error if user is not a member of the list', async () => {
      const list = await listService.createList(user._id, 'List without Member');
      const nonMember = await User.create({
        email: 'nonmember@example.com',
        username: 'nonmember',
        password: 'password123',
      });

      await expect(listService.removeMember(list._id, nonMember._id)).rejects.toThrow(AppError);
      await expect(listService.removeMember(list._id, nonMember._id)).rejects.toThrow('User is not a member of the list.');
    });
  });

  describe('removeSelf', () => {
    it('should allow a member to remove themselves from the list successfully', async () => {
      // Create another user as member
      const memberUser = await User.create({
        email: 'member@example.com',
        username: 'memberuser',
        password: 'password123',
      });

      // Create a list with owner and member
      const list = await listService.createList(user._id, 'List to Remove Self');
      await listService.addMember(list._id, memberUser.username);

      // Have the member remove themselves
      const updatedList = await listService.removeSelf(list._id, memberUser._id);

      expect(updatedList.members.length).toBe(1);
      expect(updatedList.members[0]._id.toString()).toBe(user._id.toString());

      // Verify in database
      const foundList = await List.findById(list._id);
      expect(foundList.members.length).toBe(1);
      expect(foundList.members).toContainEqual(user._id);
    });

    it('should throw an error if user is the owner of the list', async () => {
      const list = await listService.createList(user._id, 'Owner List');

      await expect(listService.removeSelf(list._id, user._id)).rejects.toThrow(AppError);
      await expect(listService.removeSelf(list._id, user._id)).rejects.toThrow('Owner cannot be removed from the list.');
    });

    it('should throw an error if list does not exist', async () => {
      const invalidListId = new mongoose.Types.ObjectId(); // Opraveno zde

      await expect(listService.removeSelf(invalidListId, user._id)).rejects.toThrow(AppError);
      await expect(listService.removeSelf(invalidListId, user._id)).rejects.toThrow('List not found.');
    });
  });

  describe('permanentlyDeleteList', () => {
    it('should permanently delete a list and its associated items', async () => {
      const list = await listService.createList(user._id, 'List to Permanently Delete');
      const item1 = await Item.create({ itemText: 'Item 1', listId: list._id });
      const item2 = await Item.create({ itemText: 'Item 2', listId: list._id });
      list.items.push(item1._id, item2._id);
      await list.save();

      const deletedList = await listService.permanentlyDeleteList(list._id);

      expect(deletedList).toBeDefined();
      expect(deletedList._id.toString()).toBe(list._id.toString());

      const foundList = await List.findById(list._id);
      expect(foundList).toBeNull();

      const foundItems = await Item.find({ listId: list._id });
      expect(foundItems.length).toBe(0);
    });

    it('should throw an error if list does not exist', async () => {
      const invalidListId = new mongoose.Types.ObjectId(); // Opraveno zde

      await expect(listService.permanentlyDeleteList(invalidListId)).rejects.toThrow(AppError);
      await expect(listService.permanentlyDeleteList(invalidListId)).rejects.toThrow('List not found.');
    });
  });

  describe('getActiveListsItemCounts', () => {
    beforeEach(async () => {
      // Vytvoření několika seznamů s různými počty položek
      const list1 = await listService.createList(user._id, 'List 1');
      const item1 = await Item.create({ itemText: 'Item 1', listId: list1._id });
      const item2 = await Item.create({ itemText: 'Item 2', listId: list1._id });
      list1.items.push(item1._id, item2._id);
      await list1.save();

      const list2 = await listService.createList(user._id, 'List 2');
      const item3 = await Item.create({ itemText: 'Item 3', listId: list2._id });
      list2.items.push(item3._id);
      await list2.save();

      const list3 = await listService.createList(user._id, 'List 3');
      // No items
    });

    it('should retrieve active lists with correct item counts', async () => {
      const lists = await List.find({ title: { $in: ['List 1', 'List 2', 'List 3'] } });
      const listIds = lists.map(list => list._id.toString());

      const counts = await listService.getActiveListsItemCounts(user._id, listIds);

      expect(counts.length).toBe(3);

      const count1 = counts.find(c => c.listId.toString() === lists[0]._id.toString());
      const count2 = counts.find(c => c.listId.toString() === lists[1]._id.toString());
      const count3 = counts.find(c => c.listId.toString() === lists[2]._id.toString());

      expect(count1.itemCount).toBe(2);
      expect(count2.itemCount).toBe(1);
      expect(count3.itemCount).toBe(0);
    });

    it('should throw an error if listIds is not an array or is empty', async () => {
      await expect(listService.getActiveListsItemCounts(user._id, null)).rejects.toThrow(AppError);
      await expect(listService.getActiveListsItemCounts(user._id, null)).rejects.toThrow('Invalid listIds.');

      await expect(listService.getActiveListsItemCounts(user._id, [])).rejects.toThrow(AppError);
      await expect(listService.getActiveListsItemCounts(user._id, [])).rejects.toThrow('Invalid listIds.');
    });

    it('should throw an error if any listId is invalid', async () => {
      const invalidListId = 'invalidid123';
      const list = await listService.createList(user._id, 'Valid List');

      await expect(listService.getActiveListsItemCounts(user._id, [list._id.toString(), invalidListId])).rejects.toThrow(AppError);
      await expect(listService.getActiveListsItemCounts(user._id, [list._id.toString(), invalidListId])).rejects.toThrow('One or more listIds are invalid.');
    });

    it('should return zero counts if no active lists are found', async () => {
      // Vytvoření seznamů, které nejsou aktivní
      const list4 = await listService.createList(user._id, 'Archived List');
      list4.isArchived = true;
      await list4.save();

      const list5 = await listService.createList(user._id, 'Deleted List');
      list5.deletedAt = new Date();
      await list5.save();

      const invalidListIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()]; // Opraveno zde
      const counts = await listService.getActiveListsItemCounts(user._id, invalidListIds);

      expect(counts.length).toBe(0);
    });
  });

  describe('permanentlyDeleteAllDeletedLists', () => {
    it('should permanently delete all soft-deleted lists for a user', async () => {
      const list1 = await listService.createList(user._id, 'Deleted List 1');
      list1.deletedAt = new Date();
      await list1.save();

      const list2 = await listService.createList(user._id, 'Deleted List 2');
      list2.deletedAt = new Date();
      await list2.save();

      const list3 = await listService.createList(user._id, 'Active List');
      // Not deleted

      const result = await listService.permanentlyDeleteAllDeletedLists(user._id);

      expect(result.deletedCount).toBe(2);

      const foundList1 = await List.findById(list1._id);
      const foundList2 = await List.findById(list2._id);
      const foundList3 = await List.findById(list3._id);

      expect(foundList1).toBeNull();
      expect(foundList2).toBeNull();
      expect(foundList3).toBeDefined();

      // Ověření, že položky byly také odstraněny
      const items = await Item.find({ listId: { $in: [list1._id, list2._id] } });
      expect(items.length).toBe(0);
    });

    it('should return zero deletedCount if no deleted lists are found', async () => {
      const list = await listService.createList(user._id, 'Active List');

      const result = await listService.permanentlyDeleteAllDeletedLists(user._id);

      expect(result.deletedCount).toBe(0);

      const foundList = await List.findById(list._id);
      expect(foundList).toBeDefined();
    });
  });
});