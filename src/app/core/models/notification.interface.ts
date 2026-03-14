export interface Notification {
  _id: string;
  recipient: Recipient;
  actor: Actor;
  type: string;
  entityType: string;
  entityId: string;
  isRead: boolean;
  createdAt: string;
  entity: Entity;
}

export interface Recipient {
  _id: string;
  name: string;
  photo: string;
}

export interface Actor {
  _id: string;
  name: string;
  photo: string;
}

export interface Entity {
  _id: string;
  content: string;
  image: string;
  commentCreator: CommentCreator;
  post: string;
  likesCount: number;
  isReply: boolean;
  id: string;
  unavailable:boolean;
}

export interface CommentCreator {
  _id: string;
  name: string;
  username: string;
  photo: string;
  followersCount: number;
  followingCount: number;
  bookmarksCount: number;
  id: string;
}