// Utility to convert camelCase keys to snake_case for Supabase
export function toSnakeCase<T = any>(obj: T): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  } else if (obj && typeof obj === 'object') {
    const newObj: Record<string, any> = {};
    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      newObj[snakeKey] = toSnakeCase((obj as any)[key]);
    }
    return newObj;
  }
  return obj;
}
