import { FriendsPipe } from './friends.pipe';

describe('FriendsPipe', () => {
  it('create an instance', () => {
    const pipe = new FriendsPipe();
    expect(pipe).toBeTruthy();
  });
});
