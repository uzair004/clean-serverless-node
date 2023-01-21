const makeValidateTokenContent = ({ makeTs }) => {
  return function validateTokenContent({ tokenContent, id }) {
    if (id && tokenContent.id !== id) {
      console.warn('Token does not belong specified to ID');
      throw new Error('Invalid Token');
    }
    if (tokenContent.createTs > makeTs()) {
      console.warn('Creation time is after current time');
      throw new Error('Invalid Token');
    }
    if (tokenContent.expiryTs < makeTs()) {
      console.warn('Token is expired');
      throw new Error('Invalid Token');
    }
  };
};

module.exports = { makeValidateTokenContent };
