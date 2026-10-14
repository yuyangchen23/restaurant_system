const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9+-]+\.[a-zA-Z]{2,}$/g;

export const isValidEmailFormat = (email: unknown): email is string => {
  if (typeof email !== "string") {
    return false;
  }

  return EMAIL_REGEX.test(email);
};

export const isValidPasswordFormat = (password: unknown): password is string => {
  if (typeof password !== "string") {
    return false;
  }
  return password.length >= 3;
}