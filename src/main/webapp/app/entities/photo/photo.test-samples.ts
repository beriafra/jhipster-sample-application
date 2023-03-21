import dayjs from 'dayjs/esm';

import { IPhoto, NewPhoto } from './photo.model';

export const sampleWithRequiredData: IPhoto = {
  id: 37945,
  title: 'grow',
  image: '../fake-data/blob/hipster.png',
  imageContentType: 'unknown',
};

export const sampleWithPartialData: IPhoto = {
  id: 59852,
  title: 'Rubber Myanmar Agent',
  description: '../fake-data/blob/hipster.txt',
  image: '../fake-data/blob/hipster.png',
  imageContentType: 'unknown',
  height: 26456,
  width: 10204,
  taken: dayjs('2023-03-20T21:40'),
};

export const sampleWithFullData: IPhoto = {
  id: 49243,
  title: 'South',
  description: '../fake-data/blob/hipster.txt',
  image: '../fake-data/blob/hipster.png',
  imageContentType: 'unknown',
  height: 36186,
  width: 9540,
  taken: dayjs('2023-03-21T17:45'),
  uploaded: dayjs('2023-03-20T23:50'),
};

export const sampleWithNewData: NewPhoto = {
  title: 'of',
  image: '../fake-data/blob/hipster.png',
  imageContentType: 'unknown',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
