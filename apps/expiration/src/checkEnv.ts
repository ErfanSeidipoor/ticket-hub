export const checkEnv = () => {
  console.log({
    POD_NAME: process.env.POD_NAME,
    REDIS_URL: process.env.REDIS_URL,
    REDIS_PORT: process.env.REDIS_PORT,
    KAFKA_URL: process.env.KAFKA_URL,
    KAFKA_GROUP: process.env.KAFKA_GROUP,
  });

  if (!process.env.POD_NAME) {
    throw new Error('POD_NAME must be Defined');
  }

  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL must be Defined');
  }

  if (!process.env.REDIS_PORT) {
    throw new Error('REDIS_PORT must be Defined');
  }

  if (!process.env.KAFKA_URL) {
    throw new Error('KAFKA_URL must be Defined');
  }

  if (!process.env.KAFKA_GROUP) {
    throw new Error('KAFKA_GROUP must be Defined');
  }
};
