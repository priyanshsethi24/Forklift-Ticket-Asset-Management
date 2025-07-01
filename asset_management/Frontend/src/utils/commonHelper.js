export const objectToQueryParams = (obj) => {
  const params = new URLSearchParams(obj);
  return params.toString();
};
