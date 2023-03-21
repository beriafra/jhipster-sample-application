import dayjs from 'dayjs/esm';

import { IAlbum, NewAlbum } from './album.model';

export const sampleWithRequiredData: IAlbum = {
  id: 51589,
  title: 'back-end',
};

export const sampleWithPartialData: IAlbum = {
  id: 99693,
  title: 'backing Table deliver',
};

export const sampleWithFullData: IAlbum = {
  id: 34293,
  title: 'SQL',
  description: '../fake-data/blob/hipster.txt',
  created: dayjs('2023-03-21T04:37'),
};

export const sampleWithNewData: NewAlbum = {
  title: 'Corporate Shoes',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
