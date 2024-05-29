export type Response<T> = {
  status: 200 | 201 | 400 | 401 | 403 | 500;
  message: string;
  data?: T;
};

export enum Status {
  Active = 'active',
  Deleted = 'deleted',
  Banned = 'banned',
  Blocked = 'blocked',
  Hidden = 'hidden',
}
