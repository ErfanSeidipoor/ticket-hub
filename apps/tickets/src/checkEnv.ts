export const checkEnv = () => {
  if (!process.env.POD_NAME) {
    throw new Error('POD_NAME must be Defined');
  }

  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be Defined');
  }

  if (!process.env.KAFKA_GROUP) {
    throw new Error('KAFKA_GROUP must be Defined');
  }

  if (!process.env.KAFKA_URL) {
    throw new Error('KAFKA_URL must be Defined');
  }

  if (!process.env.MONGO_URL) {
    throw new Error('MONGO_URL must be Defined');
  }
};
