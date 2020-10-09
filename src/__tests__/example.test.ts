import { example } from '../example';

describe('example', () => {
  it('returns message', () => {
    const message = example('foo');
    expect(message).toEqual('Hello foo!');
  });
});
