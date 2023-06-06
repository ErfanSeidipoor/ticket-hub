import buildClient from '../api/build-client';

const LandingPage = ({ currentUser }) => {
  console.log({ currentUser });
  return currentUser ? (
    <h1>You are signed in</h1>
  ) : (
    <h1>You are NOT signed in</h1>
  );
};

LandingPage.getInitialProps = async (context) => {
  console.log('LANDING PAGE!');
  const client = buildClient(context);

  let data = {};
  try {
    const response = await client.get('/api/auth/current-user');
    data = response.data;
  } catch (error) {
    console.log('LandingPage error > ', error.message);
  }

  console.log({ data });
  return data;
};

export default LandingPage;
