import { RefManager, createRefManager } from '../ref-object';

describe('ref test', () => {
  let Test: RefManager;

  beforeEach(() => {
    Test = createRefManager(['a', 'b', 'c']);
  });

  it('init test', () => {
    const t1 = Test.init({ a: 1, b: 2, c: 3 });
    const t2 = Test.init({ a: 1, b: 2, c: 0 });
    const t3 = Test.init({ a: 0, b: 0, c: 0 });
    const t4 = Test.init({ a: 1, b: 2, c: 3 });
    const t5 = Test.init({ a: 1, b: 0, c: 0 });
    const t6 = Test.init({ a: 0, b: 0, c: 0 });
    expect(t1).not.toBe(t2);
    expect(t1).not.toBe(t3);
    expect(t1).toBe(t4);
    expect(t1).not.toBe(t5);
    expect(t1).not.toBe(t6);
    expect(t2).not.toBe(t3);
    expect(t2).not.toBe(t4);
    expect(t2).not.toBe(t5);
    expect(t2).not.toBe(t6);
    expect(t3).not.toBe(t4);
    expect(t3).not.toBe(t5);
    expect(t3).toBe(t6);
    expect(t4).not.toBe(t5);
    expect(t4).not.toBe(t6);
    expect(t5).not.toBe(t6);
  });

  it('get test', () => {
    const t = Test.init({b: 1});
    expect(t.get('a')).toBe(undefined);
    expect(t.get('b')).toBe(1);
    expect(t.get('c')).toBe(undefined);
  });

  it('set test', () => {
    const t1 = Test.init({b: 1});
    const t2 = t1.set('b', 2);
    expect(t2.get('b')).toBe(2);
    expect(t2).not.toBe(t1);
    const t3 = t2.set('b', 1);
    expect(t3).not.toBe(t2);
    expect(t3).toBe(t1);
  });
});