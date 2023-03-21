import dayjs from 'dayjs/esm';
import { IUser } from 'app/entities/user/user.model';

export interface IAlbum {
  id: number;
  title?: string | null;
  description?: string | null;
  created?: dayjs.Dayjs | null;
  user?: Pick<IUser, 'id' | 'login'> | null;
}

export type NewAlbum = Omit<IAlbum, 'id'> & { id: null };
