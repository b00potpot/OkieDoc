/**
 * api/controllers/UserController.js
 * Sails.js User Controller
 */

module.exports = {

  /**
   * GET /api/users
   */
  getAllUsers: async function (req, res) {
    try {
      const users = await User.find()
        .select([
          "id",
          "firstName",
          "lastName",
          "email",
          "role",
          "createdAt",
        ]);

      return res.ok(users);
    } catch (err) {
      console.error("getAllUsers error:", err);
      return res.serverError({
        message: "Failed to fetch users.",
        error: err.message,
      });
    }
  },

  /**
   * GET /api/users/:id
   */
  getUserById: async function (req, res) {
    try {
      const { id } = req.params;
      const user = await User.findOne({ id });

      if (!user) {
        return res.notFound({
          message: "User not found.",
        });
      }

      return res.ok(user);
    } catch (err) {
      console.error("getUserById error:", err);
      return res.serverError({
        message: "Failed to fetch user.",
        error: err.message,
      });
    }
  },

  /**
   * GET /api/users/staff?role=doctor
   * GET /api/users/staff?role=nurse
   */
  getStaff: async function (req, res) {
    try {
      const requestedRole = req.query.role;

      if (!requestedRole) {
        return res.badRequest({
          message: "Role query parameter is required.",
        });
      }

      const allowedRoles = [
        "doctor",
        "nurse",
        "admin",
      ];

      if (!allowedRoles.includes(requestedRole)) {
        return res.badRequest({
          message: "Invalid role supplied.",
        });
      }

      const staff = await User.find({
        role: requestedRole,
      }).select([
        "id",
        "firstName",
        "lastName",
        "email",
        "role",
      ]);

      return res.ok(staff);
    } catch (err) {
      console.error("getStaff error:", err);
      return res.serverError({
        message: "Failed to fetch staff.",
        error: err.message,
      });
    }
  },

  /**
   * POST /api/users
   */
  createUser: async function (req, res) {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        role,
      } = req.body;

      if (!firstName || !lastName || !email || !password || !role) {
        return res.badRequest({
          message: "Missing required fields.",
        });
      }

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.badRequest({
          message: "Email already exists.",
        });
      }

      const newUser = await User.create({
        firstName,
        lastName,
        email,
        password,
        role,
      }).fetch();

      return res.ok({
        message: "User created successfully.",
        user: newUser,
      });
    } catch (err) {
      console.error("createUser error:", err);
      return res.serverError({
        message: "Failed to create user.",
        error: err.message,
      });
    }
  },

  /**
   * PUT /api/users/:id
   */
  updateUser: async function (req, res) {
    try {
      const { id } = req.params;

      const updatedUser = await User.updateOne({ id })
        .set(req.body);

      if (!updatedUser) {
        return res.notFound({
          message: "User not found.",
        });
      }

      return res.ok({
        message: "User updated successfully.",
        user: updatedUser,
      });
    } catch (err) {
      console.error("updateUser error:", err);
      return res.serverError({
        message: "Failed to update user.",
        error: err.message,
      });
    }
  },

  /**
   * DELETE /api/users/:id
   */
  deleteUser: async function (req, res) {
    try {
      const { id } = req.params;

      const deletedUser = await User.destroyOne({ id });

      if (!deletedUser) {
        return res.notFound({
          message: "User not found.",
        });
      }

      return res.ok({
        message: "User deleted successfully.",
      });
    } catch (err) {
      console.error("deleteUser error:", err);
      return res.serverError({
        message: "Failed to delete user.",
        error: err.message,
      });
    }
  },

};