export const checkEnv = () => {
  if (!process.env['JWT_KEY']) {
    throw new Error('JWT_KEY must be Defined');
  }
};
