import { IPhoto } from 'app/entities/photo/photo.model';

export interface ITag {
  id: number;
  name?: string | null;
  photos?: Pick<IPhoto, 'id'>[] | null;
}

export type NewTag = Omit<ITag, 'id'> & { id: null };
