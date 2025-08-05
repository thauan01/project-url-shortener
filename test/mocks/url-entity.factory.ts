import { Url } from '../../src/domain/entity/url.entity';
import { User } from '../../src/domain/entity/user.entity';

export const makeFakeUrl = (overrides: Partial<Url> = {}): Url => {
  const fakeUrl = new Url();
  
  fakeUrl.id = overrides.id || 'test-url-id-123';
  fakeUrl.originalUrl = overrides.originalUrl || 'https://www.example.com/very-long-url-to-be-shortened';
  fakeUrl.shortCode = overrides.shortCode || 'abc123';
  fakeUrl.createdAt = overrides.createdAt || new Date('2025-01-01T10:00:00Z');
  fakeUrl.updatedAt = overrides.updatedAt || new Date('2025-01-01T10:00:00Z');
  fakeUrl.deletedAt = overrides.deletedAt || null;
  fakeUrl.accessCount = overrides.accessCount || 0;
  fakeUrl.userId = overrides.userId || 'test-user-id-456';
  fakeUrl.user = overrides.user || undefined;

  return fakeUrl;
};

export const makeFakeUrlWithUser = (userOverrides: Partial<User> = {}, urlOverrides: Partial<Url> = {}): Url => {
  const fakeUser = new User();
  fakeUser.id = userOverrides.id || 'test-user-id-456';
  fakeUser.name = userOverrides.name || 'Test User';
  fakeUser.email = userOverrides.email || 'test@example.com';
  fakeUser.password = userOverrides.password || 'hashedpassword';
  fakeUser.createdAt = userOverrides.createdAt || new Date('2025-01-01T09:00:00Z');
  fakeUser.updatedAt = userOverrides.updatedAt || new Date('2025-01-01T09:00:00Z');

  const fakeUrl = makeFakeUrl(urlOverrides);
  fakeUrl.user = fakeUser;
  fakeUrl.userId = fakeUser.id;

  return fakeUrl;
};

export const makeFakeUrlArray = (count: number = 3, overrides: Partial<Url>[] = []): Url[] => {
  const urls: Url[] = [];
  
  for (let i = 0; i < count; i++) {
    const urlOverride = overrides[i] || {};
    urls.push(makeFakeUrl({
      id: `test-url-id-${i + 1}`,
      shortCode: `abc${i + 1}23`,
      originalUrl: `https://www.example${i + 1}.com/path`,
      accessCount: i * 5,
      ...urlOverride
    }));
  }
  
  return urls;
};
