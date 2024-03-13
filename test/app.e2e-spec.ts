import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto';
import { PrismaService } from '../src/prisma/prisma.service';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';


describe('App e2e', () => {
  it.todo('should pass e2e');
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const modelRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = modelRef.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      })
    )
    await app.init();
    await app.listen(3333);
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  })

  describe('Auth', () => {
    const authDto: AuthDto = {
      email: 'test@gmail.com',
      password: '123'
    };
    describe('Signup', () => {
      it('should Email not empty', () => {
        return pactum.spec()
          .post('/auth/signup')
          .withBody({ password: authDto.password })
          .expectStatus(400);
      });
      it('should Email not empty', () => {
        return pactum.spec()
          .post('/auth/signup')
          .withBody({ email: authDto.email })
          .expectStatus(400);
      });
      it('should body empty', () => {
        return pactum.spec()
          .post('/auth/signup')
          .expectStatus(400);
      });
      it('should Signup', () => {
        return pactum.spec()
          .post('/auth/signup')
          .withBody(authDto)
          .expectStatus(201);
      });
    });
    describe('Signin', () => {
      it('should Email not empty', () => {
        return pactum.spec()
          .post('/auth/signin')
          .withBody({ password: authDto.password })
          .expectStatus(400);
      });
      it('should Email not empty', () => {
        return pactum.spec()
          .post('/auth/signin')
          .withBody({ email: authDto.email })
          .expectStatus(400);
      });
      it('should body empty', () => {
        return pactum.spec()
          .post('/auth/signin')
          .expectStatus(400);
      });
      it('should Sign in', () => {
        return pactum.spec()
          .post('/auth/signin')
          .withBody(authDto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get Me', () => {
      it('should check token', () => {
        return pactum.spec()
          .get('/users/me')
          .expectStatus(401);
      });

      it('should get current user', () => {
        return pactum.spec()
          .get('/users/me')
          .withHeaders({
            'Authorization': 'Bearer $S{userAt}'
          })
          .expectStatus(200);
      });
    });
    describe('Edit user', () => {
      it('should edit user ', () => {
        const editDto: EditUserDto = {
          Fname: 'Test',
          Lname: 'User'
        };
        return pactum.spec()
          .patch('/users')
          .withHeaders({
            'Authorization': 'Bearer $S{userAt}'
          })
          .withBody(editDto)
          .expectStatus(200)
          .expectBodyContains(editDto.Fname);
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Get empty bookmarks', () => {
      it('it should get empty bookmarks user', () => {
        return pactum.spec()
          .get('/bookmarks')
          .withHeaders({
            'Authorization': 'Bearer $S{userAt}'
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });
    describe('Create Bookmark', () => {
      const dto: CreateBookmarkDto = {
        'title': 'test',
        'Description': 'testing',
        'link': 'checking'
      };
      it('it should create bookmarks user', () => {
        return pactum.spec()
          .post('/bookmarks')
          .withHeaders({
            'Authorization': 'Bearer $S{userAt}'
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });
    describe('Get bookmarks', () => {
      it('it should get bookmarks user', () => {
        return pactum.spec()
          .get('/bookmarks')
          .withHeaders({
            'Authorization': 'Bearer $S{userAt}'
          })
          .expectStatus(200)
      });
    });
    describe('Get bookmark by id', () => {
      it('it should get bookmarks by id', () => {
        return pactum.spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            'Authorization': 'Bearer $S{userAt}'
          })
          .expectStatus(200);
      });
    });
    describe('Edit bookmark', () => {
      const dto: EditBookmarkDto = {
        'title': 'test Updated',
      };
      it('it should edit bookmark', () => {
        return pactum.spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            'Authorization': 'Bearer $S{userAt}'
          })
          .withBody(dto)
          .expectStatus(200);
      });
    });
    describe('Delete bookmark', () => {
      it('it should delte bookmark', () => {
        return pactum.spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            'Authorization': 'Bearer $S{userAt}'
          })
          .expectStatus(204)
      });
      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});