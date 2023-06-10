export const assignDefinedProps = <T>(obj: T, props: Partial<T>) => {
  for (const key in props) {
    const value = props[key];
    if (typeof value !== 'undefined') {
      obj[key] = value!;
    }
  }
  return obj;
};
