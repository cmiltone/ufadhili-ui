export const setAuth = (
  authData: {
    token?: string;
    url?: string;
    user?: User;
  },
  redirect = true
): void => {
  try {
    if (authData.token) localStorage.setItem("token", authData.token);

    if (authData.user) localStorage.setItem("user", JSON.stringify(authData.user));

    if (redirect) {
      const url = authData.url ? authData.url : "/";

      location.assign(url);
    }
  } catch (error) {
    console.log("error setting auth ", error);
  }
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token") || false;
  const user = localStorage.getItem("user") || false;
  const s = !!token && !!user;

  return (
    s &&
    typeof token === "string" &&
    // typeof user === "string" &&
    token !== "undefined" &&
    token !== "null" &&
    user !== "undefined" &&
    user !== "null" &&
    user !== "[object Object]"
  );
};

export const isAuthorizedAccess = (accessType = "*"): boolean => {
  if (!isAuthenticated()) return false;
  return !!accessType;
};

export const getAuthUser = (): User => {
  return JSON.parse(`${localStorage.getItem("user")}`);
};

export const getAuthToken = (): string => {
  if (!isAuthenticated()) return "";

  return `${localStorage.getItem("token") ?? ""}`;
};

export const clearAuth = (to?: string, redirect = true): void => {
  localStorage.clear();
  if (redirect) location.assign(`/auth?redirectUrl=${to ?? "/"}`);
};
