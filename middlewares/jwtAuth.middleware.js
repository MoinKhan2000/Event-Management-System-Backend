import jwt from 'jsonwebtoken'
const jwtAuth = (req, res, next) => {
  // 1. Read the token
  // console.log(req.headers);
  const token = req.headers['authorization']

  // 2. If no token return the error.
  if (!token) {
    return res.status(401).send('No token found')
  }

  // 3. check if token is valid
  try {
    const payload = jwt.verify(token, 'SECRET_KEY')
    req.userId = payload.userId
    req.email = payload.email
    req.token = token

    // 4. call next middleware
    next()

  } catch (error) {
    // 5. return errorr
    return res.status(401).send('Unauthorized')
  }

}

export default jwtAuth