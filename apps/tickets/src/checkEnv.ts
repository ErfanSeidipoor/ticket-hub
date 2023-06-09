export const checkEnv = () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be Defined');
  }

  if (!process.env.MONGO_URL) {
    throw new Error('MONGO_URL must be Defined');
  }
};
