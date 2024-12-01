'use client';

/**
 * `ListMembers`:
 * - Displays a list of members in a group or list.
 * - Allows the owner to add new members by username using the `AddMemberByUsernameForm`.
 * - Enables members (non-owners) to leave the list using a "Leave List" button.
 * - Utilizes `DetailsContext` for accessing and managing member data.
 * - Dynamically checks the user's role (owner or member) to adjust available actions.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDetails } from '@/context/DetailsContext';
import { useAuth } from '@/context/AuthContext';
import Member from './Member';
import AddMemberByUsernameForm from './AddMemberByUsernameForm';

const ListMembers = () => {
  const { t } = useTranslation();
  const { members, listData, removeSelf } = useDetails();
  const { currentUser } = useAuth();

  const isOwner = listData.ownerId._id === currentUser.id;

  const handleLeaveList = async () => {
    await removeSelf();
  };

  return (
    <div className="box">
      <h2>{t('members')}</h2>
      <ul>
        {members.map((member, index) => (
          <Member
            key={member._id}
            memberId={member._id}
            memberName={member.username}
            isMemberOwner={member._id === listData.ownerId._id}
            isCurrentUser={member._id === currentUser.id}
            index={index}
          />
        ))}
      </ul>
      {isOwner && (
        <AddMemberByUsernameForm />
      )}
      {!isOwner && (
        <button onClick={handleLeaveList} className="leave-button">
          {t('leave_list')}
        </button>
      )}
    </div>
  );
};

export default ListMembers;