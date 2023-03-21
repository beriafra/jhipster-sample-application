import dayjs from 'dayjs/esm';
import { IAlbum } from 'app/entities/album/album.model';
import { ITag } from 'app/entities/tag/tag.model';

export interface IPhoto {
  id: number;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  imageContentType?: string | null;
  height?: number | null;
  width?: number | null;
  taken?: dayjs.Dayjs | null;
  uploaded?: dayjs.Dayjs | null;
  album?: Pick<IAlbum, 'id' | 'title'> | null;
  tags?: Pick<ITag, 'id' | 'name'>[] | null;
}

export type NewPhoto = Omit<IPhoto, 'id'> & { id: null };
