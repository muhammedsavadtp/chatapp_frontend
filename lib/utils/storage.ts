
interface StorageOptions {
  expiresInDays?: number;
}

const isDev = process.env.NODE_ENV === "development";

export const setStorageValue = (
  key: string,
  value: string,
  options: StorageOptions = {}
) => {
  const { expiresInDays } = options;

  if (isDev) {
    // Use localStorage in development and sync with cookies for middleware
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value);
      // Sync to cookies for server-side middleware
      let cookieString = `${key}=${value}; Path=/; SameSite=Strict`;
      if (expiresInDays) {
        const expires = new Date();
        expires.setDate(expires.getDate() + expiresInDays);
        cookieString += `; Expires=${expires.toUTCString()}`;
      }
      document.cookie = cookieString;
    }
  } else {
    // Use cookies in production
    let cookieString = `${key}=${value}; Path=/; SameSite=Strict`;
    if (expiresInDays) {
      const expires = new Date();
      expires.setDate(expires.getDate() + expiresInDays);
      cookieString += `; Expires=${expires.toUTCString()}`;
    }
    document.cookie = cookieString;
  }
};

export const getStorageValue = (key: string): string | null => {
  if (isDev) {
    return typeof window !== "undefined" ? localStorage.getItem(key) : null;
  } else {
    return (
      document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${key}=`))
        ?.split("=")[1] || null
    );
  }
};

export const removeStorageValue = (key: string) => {
  if (isDev) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
      document.cookie = `${key}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  } else {
    document.cookie = `${key}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
};
