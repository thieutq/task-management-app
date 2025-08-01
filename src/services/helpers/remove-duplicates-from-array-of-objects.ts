function removeDuplicatesFromArrayObjects<T>(array: T[], key: keyof T | never) {
  const lookup = new Set();

  return array
    .filter((value) => !lookup.has(value?.[key]) && lookup.add(value?.[key]))
    .filter((value) => !!value);
}

export default removeDuplicatesFromArrayObjects;
