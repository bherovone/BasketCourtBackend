const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send("Authorization header missing or improperly formatted");
    }

    const token = authHeader.split(" ")[1];
    const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!verifiedToken) {
      return res.status(401).send("Token error");
    }

    req.locals = { userId: verifiedToken.userId, role: verifiedToken.role }; // Include role in req.locals
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).send("Authentication failed");
  }
};

const checkAdmin = (req, res, next) => {
  if (req.locals.role !== "admin") {
    return res.status(403).send("Access denied: Admins only");
  }
  next();
};

module.exports = { auth, checkAdmin };
