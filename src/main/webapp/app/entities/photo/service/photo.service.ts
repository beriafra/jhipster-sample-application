import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IPhoto, NewPhoto } from '../photo.model';

export type PartialUpdatePhoto = Partial<IPhoto> & Pick<IPhoto, 'id'>;

type RestOf<T extends IPhoto | NewPhoto> = Omit<T, 'taken' | 'uploaded'> & {
  taken?: string | null;
  uploaded?: string | null;
};

export type RestPhoto = RestOf<IPhoto>;

export type NewRestPhoto = RestOf<NewPhoto>;

export type PartialUpdateRestPhoto = RestOf<PartialUpdatePhoto>;

export type EntityResponseType = HttpResponse<IPhoto>;
export type EntityArrayResponseType = HttpResponse<IPhoto[]>;

@Injectable({ providedIn: 'root' })
export class PhotoService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/photos');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(photo: NewPhoto): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(photo);
    return this.http.post<RestPhoto>(this.resourceUrl, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(photo: IPhoto): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(photo);
    return this.http
      .put<RestPhoto>(`${this.resourceUrl}/${this.getPhotoIdentifier(photo)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(photo: PartialUpdatePhoto): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(photo);
    return this.http
      .patch<RestPhoto>(`${this.resourceUrl}/${this.getPhotoIdentifier(photo)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestPhoto>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestPhoto[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getPhotoIdentifier(photo: Pick<IPhoto, 'id'>): number {
    return photo.id;
  }

  comparePhoto(o1: Pick<IPhoto, 'id'> | null, o2: Pick<IPhoto, 'id'> | null): boolean {
    return o1 && o2 ? this.getPhotoIdentifier(o1) === this.getPhotoIdentifier(o2) : o1 === o2;
  }

  addPhotoToCollectionIfMissing<Type extends Pick<IPhoto, 'id'>>(
    photoCollection: Type[],
    ...photosToCheck: (Type | null | undefined)[]
  ): Type[] {
    const photos: Type[] = photosToCheck.filter(isPresent);
    if (photos.length > 0) {
      const photoCollectionIdentifiers = photoCollection.map(photoItem => this.getPhotoIdentifier(photoItem)!);
      const photosToAdd = photos.filter(photoItem => {
        const photoIdentifier = this.getPhotoIdentifier(photoItem);
        if (photoCollectionIdentifiers.includes(photoIdentifier)) {
          return false;
        }
        photoCollectionIdentifiers.push(photoIdentifier);
        return true;
      });
      return [...photosToAdd, ...photoCollection];
    }
    return photoCollection;
  }

  protected convertDateFromClient<T extends IPhoto | NewPhoto | PartialUpdatePhoto>(photo: T): RestOf<T> {
    return {
      ...photo,
      taken: photo.taken?.toJSON() ?? null,
      uploaded: photo.uploaded?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restPhoto: RestPhoto): IPhoto {
    return {
      ...restPhoto,
      taken: restPhoto.taken ? dayjs(restPhoto.taken) : undefined,
      uploaded: restPhoto.uploaded ? dayjs(restPhoto.uploaded) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestPhoto>): HttpResponse<IPhoto> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestPhoto[]>): HttpResponse<IPhoto[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
