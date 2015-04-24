export function defaults(value, defaultValue) {
  return value !== undefined ? value : defaultValue;
}

export function respondTo(object, methodName) {
  return object != null && typeof object[methodName] === "function";
}

export function extend(a, b) {
  let result = {};

  for (let key in a) {
    if (a.hasOwnProperty(key)) {
      result[key] = a[key];
    }
  }
  for (let key in b) {
    if (b.hasOwnProperty(key)) {
      result[key] = b[key];
    }
  }

  return result;
}
