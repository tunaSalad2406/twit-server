const { sign } = require("jsonwebtoken");
const { verify } = require("jsonwebtoken");

const secret = "duong.vu"

const setTokens = (user: any) => {
  const sevenDays = 60 * 60 * 24 * 7 * 1000;
  const fifteenMins = 60 * 15 * 1000;
  const accessUser = {
    id: user.id
  };
  const accessToken = sign(
    { user: accessUser },
    secret,
    {
      expiresIn: fifteenMins
    }
  );
  const refreshUser = {
    id: user.id,
  };
  const refreshToken = sign(
    { user: refreshUser },
    secret,
    {
      expiresIn: sevenDays
    }
  );
  return { accessToken, refreshToken };
}

const validateAccessToken = (token: any) => {
  try {
    return verify(token, secret);
  } catch {
    return null;
  }
}

const validateRefreshToken = (token: any) => {
  try {
    return verify(token, secret);
  } catch {
    return null;
  }
}

export { setTokens, validateAccessToken, validateRefreshToken }
