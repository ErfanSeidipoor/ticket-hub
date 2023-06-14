export const sleep = (delay?: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, delay || 2000);
  });
};
