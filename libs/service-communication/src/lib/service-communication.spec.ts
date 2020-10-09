import { fromArray } from '@effect-ts/system/Stream/Stream/fromArray';

import { listen } from './service-communication';

describe('effectTsEpic', () => {
  it('should work', () => {
    expect(listen).toEqual('effect-ts-epic');
    expect(fromArray([])).toEqual('effect-ts-epic');
  });
});
