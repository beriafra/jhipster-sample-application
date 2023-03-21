import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { AlbumFormService } from './album-form.service';
import { AlbumService } from '../service/album.service';
import { IAlbum } from '../album.model';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/user.service';

import { AlbumUpdateComponent } from './album-update.component';

describe('Album Management Update Component', () => {
  let comp: AlbumUpdateComponent;
  let fixture: ComponentFixture<AlbumUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let albumFormService: AlbumFormService;
  let albumService: AlbumService;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [AlbumUpdateComponent],
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(AlbumUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(AlbumUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    albumFormService = TestBed.inject(AlbumFormService);
    albumService = TestBed.inject(AlbumService);
    userService = TestBed.inject(UserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call User query and add missing value', () => {
      const album: IAlbum = { id: 456 };
      const user: IUser = { id: 35257 };
      album.user = user;

      const userCollection: IUser[] = [{ id: 14001 }];
      jest.spyOn(userService, 'query').mockReturnValue(of(new HttpResponse({ body: userCollection })));
      const additionalUsers = [user];
      const expectedCollection: IUser[] = [...additionalUsers, ...userCollection];
      jest.spyOn(userService, 'addUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ album });
      comp.ngOnInit();

      expect(userService.query).toHaveBeenCalled();
      expect(userService.addUserToCollectionIfMissing).toHaveBeenCalledWith(
        userCollection,
        ...additionalUsers.map(expect.objectContaining)
      );
      expect(comp.usersSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const album: IAlbum = { id: 456 };
      const user: IUser = { id: 45619 };
      album.user = user;

      activatedRoute.data = of({ album });
      comp.ngOnInit();

      expect(comp.usersSharedCollection).toContain(user);
      expect(comp.album).toEqual(album);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAlbum>>();
      const album = { id: 123 };
      jest.spyOn(albumFormService, 'getAlbum').mockReturnValue(album);
      jest.spyOn(albumService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ album });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: album }));
      saveSubject.complete();

      // THEN
      expect(albumFormService.getAlbum).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(albumService.update).toHaveBeenCalledWith(expect.objectContaining(album));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAlbum>>();
      const album = { id: 123 };
      jest.spyOn(albumFormService, 'getAlbum').mockReturnValue({ id: null });
      jest.spyOn(albumService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ album: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: album }));
      saveSubject.complete();

      // THEN
      expect(albumFormService.getAlbum).toHaveBeenCalled();
      expect(albumService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAlbum>>();
      const album = { id: 123 };
      jest.spyOn(albumService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ album });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(albumService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareUser', () => {
      it('Should forward to userService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(userService, 'compareUser');
        comp.compareUser(entity, entity2);
        expect(userService.compareUser).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
