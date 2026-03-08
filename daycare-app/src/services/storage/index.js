export const saveToken = (key, value) => {
  try {
    return localStorage.setItem(key, value);
  } catch (error) {
    return error;
  }
};

export const restoreToken = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return error;
  }
};
