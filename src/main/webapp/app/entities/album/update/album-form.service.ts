import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IAlbum, NewAlbum } from '../album.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IAlbum for edit and NewAlbumFormGroupInput for create.
 */
type AlbumFormGroupInput = IAlbum | PartialWithRequiredKeyOf<NewAlbum>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IAlbum | NewAlbum> = Omit<T, 'created'> & {
  created?: string | null;
};

type AlbumFormRawValue = FormValueOf<IAlbum>;

type NewAlbumFormRawValue = FormValueOf<NewAlbum>;

type AlbumFormDefaults = Pick<NewAlbum, 'id' | 'created'>;

type AlbumFormGroupContent = {
  id: FormControl<AlbumFormRawValue['id'] | NewAlbum['id']>;
  title: FormControl<AlbumFormRawValue['title']>;
  description: FormControl<AlbumFormRawValue['description']>;
  created: FormControl<AlbumFormRawValue['created']>;
  user: FormControl<AlbumFormRawValue['user']>;
};

export type AlbumFormGroup = FormGroup<AlbumFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class AlbumFormService {
  createAlbumFormGroup(album: AlbumFormGroupInput = { id: null }): AlbumFormGroup {
    const albumRawValue = this.convertAlbumToAlbumRawValue({
      ...this.getFormDefaults(),
      ...album,
    });
    return new FormGroup<AlbumFormGroupContent>({
      id: new FormControl(
        { value: albumRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      title: new FormControl(albumRawValue.title, {
        validators: [Validators.required],
      }),
      description: new FormControl(albumRawValue.description),
      created: new FormControl(albumRawValue.created),
      user: new FormControl(albumRawValue.user),
    });
  }

  getAlbum(form: AlbumFormGroup): IAlbum | NewAlbum {
    return this.convertAlbumRawValueToAlbum(form.getRawValue() as AlbumFormRawValue | NewAlbumFormRawValue);
  }

  resetForm(form: AlbumFormGroup, album: AlbumFormGroupInput): void {
    const albumRawValue = this.convertAlbumToAlbumRawValue({ ...this.getFormDefaults(), ...album });
    form.reset(
      {
        ...albumRawValue,
        id: { value: albumRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): AlbumFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      created: currentTime,
    };
  }

  private convertAlbumRawValueToAlbum(rawAlbum: AlbumFormRawValue | NewAlbumFormRawValue): IAlbum | NewAlbum {
    return {
      ...rawAlbum,
      created: dayjs(rawAlbum.created, DATE_TIME_FORMAT),
    };
  }

  private convertAlbumToAlbumRawValue(
    album: IAlbum | (Partial<NewAlbum> & AlbumFormDefaults)
  ): AlbumFormRawValue | PartialWithRequiredKeyOf<NewAlbumFormRawValue> {
    return {
      ...album,
      created: album.created ? album.created.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
