import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IPhoto, NewPhoto } from '../photo.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IPhoto for edit and NewPhotoFormGroupInput for create.
 */
type PhotoFormGroupInput = IPhoto | PartialWithRequiredKeyOf<NewPhoto>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IPhoto | NewPhoto> = Omit<T, 'taken' | 'uploaded'> & {
  taken?: string | null;
  uploaded?: string | null;
};

type PhotoFormRawValue = FormValueOf<IPhoto>;

type NewPhotoFormRawValue = FormValueOf<NewPhoto>;

type PhotoFormDefaults = Pick<NewPhoto, 'id' | 'taken' | 'uploaded' | 'tags'>;

type PhotoFormGroupContent = {
  id: FormControl<PhotoFormRawValue['id'] | NewPhoto['id']>;
  title: FormControl<PhotoFormRawValue['title']>;
  description: FormControl<PhotoFormRawValue['description']>;
  image: FormControl<PhotoFormRawValue['image']>;
  imageContentType: FormControl<PhotoFormRawValue['imageContentType']>;
  height: FormControl<PhotoFormRawValue['height']>;
  width: FormControl<PhotoFormRawValue['width']>;
  taken: FormControl<PhotoFormRawValue['taken']>;
  uploaded: FormControl<PhotoFormRawValue['uploaded']>;
  album: FormControl<PhotoFormRawValue['album']>;
  tags: FormControl<PhotoFormRawValue['tags']>;
};

export type PhotoFormGroup = FormGroup<PhotoFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class PhotoFormService {
  createPhotoFormGroup(photo: PhotoFormGroupInput = { id: null }): PhotoFormGroup {
    const photoRawValue = this.convertPhotoToPhotoRawValue({
      ...this.getFormDefaults(),
      ...photo,
    });
    return new FormGroup<PhotoFormGroupContent>({
      id: new FormControl(
        { value: photoRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      title: new FormControl(photoRawValue.title, {
        validators: [Validators.required],
      }),
      description: new FormControl(photoRawValue.description),
      image: new FormControl(photoRawValue.image, {
        validators: [Validators.required],
      }),
      imageContentType: new FormControl(photoRawValue.imageContentType),
      height: new FormControl(photoRawValue.height),
      width: new FormControl(photoRawValue.width),
      taken: new FormControl(photoRawValue.taken),
      uploaded: new FormControl(photoRawValue.uploaded),
      album: new FormControl(photoRawValue.album),
      tags: new FormControl(photoRawValue.tags ?? []),
    });
  }

  getPhoto(form: PhotoFormGroup): IPhoto | NewPhoto {
    return this.convertPhotoRawValueToPhoto(form.getRawValue() as PhotoFormRawValue | NewPhotoFormRawValue);
  }

  resetForm(form: PhotoFormGroup, photo: PhotoFormGroupInput): void {
    const photoRawValue = this.convertPhotoToPhotoRawValue({ ...this.getFormDefaults(), ...photo });
    form.reset(
      {
        ...photoRawValue,
        id: { value: photoRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): PhotoFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      taken: currentTime,
      uploaded: currentTime,
      tags: [],
    };
  }

  private convertPhotoRawValueToPhoto(rawPhoto: PhotoFormRawValue | NewPhotoFormRawValue): IPhoto | NewPhoto {
    return {
      ...rawPhoto,
      taken: dayjs(rawPhoto.taken, DATE_TIME_FORMAT),
      uploaded: dayjs(rawPhoto.uploaded, DATE_TIME_FORMAT),
    };
  }

  private convertPhotoToPhotoRawValue(
    photo: IPhoto | (Partial<NewPhoto> & PhotoFormDefaults)
  ): PhotoFormRawValue | PartialWithRequiredKeyOf<NewPhotoFormRawValue> {
    return {
      ...photo,
      taken: photo.taken ? photo.taken.format(DATE_TIME_FORMAT) : undefined,
      uploaded: photo.uploaded ? photo.uploaded.format(DATE_TIME_FORMAT) : undefined,
      tags: photo.tags ?? [],
    };
  }
}
