import * as lodash from 'lodash';

export default function merge<TObject, TSource>(object: TObject, source: TSource) {
  return lodash.mergeWith(object, source, (objValue, srcValue) => {
    if (objValue instanceof Array) {
      return objValue.concat(srcValue);
    }
  });
}