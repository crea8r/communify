const sessions = {};

const getSessions = () => {
  return sessions;
};

const setSession = (username, kp) => {
  sessions[username] = { kp };
};

const deleteSession = (username) => {
  delete sessions[username];
};

module.exports = {
  getSessions,
  setSession,
  deleteSession,
};
