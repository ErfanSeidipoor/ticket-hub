export const buildUrl = (
  baseUrl: string,
  params: { [key: string]: string | number } = {},
  queries: { [key: string]: any } = {}
): string => {
  let url = baseUrl;

  for (const key in params) {
    url = url.replace(':' + key, params[key].toString());
  }

  if (Object.keys(queries)) {
    const search = new URLSearchParams();

    for (const key in queries) {
      search.append(key, queries[key]);
    }

    url = url + '?' + search.toString();
  }

  return url;
};
