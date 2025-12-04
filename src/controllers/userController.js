const User = require('../models/User');
const UserType = require('../models/UserType');

const userController = {
    getAllUsers: async (req, res) => {
        try {
            // Fetch all users with their user types, excluding passwords
            // TODO: Implement pagination and filtering
            
            const users = await User.findAll({
                include: { model: UserType, as: 'userType' },
                attributes: { exclude: ['password'] },
            });
            return res.status(200).json({ users });
        } catch (error) {
            return res.status(500).json({ message: 'Failed to retrieve users', error: error.message });
        }
    },

    getAllUserTypes: async (req, res) => {
        try {
            const userTypes = await UserType.findAll({
                attributes: ['id', 'name', 'access_level']
            });
            return res.status(200).json({ userTypes });
        } catch (error) {
            return res.status(500).json({ message: 'Failed to retrieve user types', error: error.message });
        }
    },

    updateUser: async (req, res) => {
        try {
            const userId = req.params.id;
            const { firstName, lastName, userTypeId } = req.body;
            const user = await User.findByPk(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            user.first_name = firstName || user.firstName;
            user.last_name = lastName || user.lastName;

            if(userTypeId) {
                const userType = await UserType.findByPk(userTypeId);
                console.log('Requested user type:', userTypeId, userType);
                if(!userType) {
                    return res.status(400).json({ message: 'Invalid user type' });
                }
                // Only allow admins to change user types and no user can assign higher access level
                if(req.user.userType.access_level < 2) {
                    return res.status(403).json({ message: 'Insufficient permissions to change user type' });
                }
                if(userTypeId !== user.usertypeid) {
                    if(userType.access_level > req.user.userType.access_level) {
                        return res.status(403).json({ message: 'Cannot assign higher access level' });
                    }
                    user.userTypeId = userTypeId;
                }
            }
            await user.save();
            const updatedUser = await User.findByPk(userId, {
                include: { model: UserType, as: 'userType' },
                attributes: { exclude: ['password'] },
            });
            return res.status(200).json({ message: 'User updated successfully', user: updatedUser });
        } catch (error) {
            return res.status(500).json({ message: 'Failed to update user', error: error.message });
        }
    },

    deleteUser: async (req, res) => {
        try {
            const userId = req.params.id;
            if (req.user.id === userId) {
                return res.status(400).json({ message: 'Cannot delete own account' });
            }
            const user = await User.findByPk(userId, {
                include: { model: UserType, as: 'userType' },
            });
            // Ensure the requester has higher access level than the target user
            if(req.user.userType.access_level <= user.userType.access_level) {
                return res.status(403).json({ message: 'Insufficient permissions to delete this user' });
            }
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            await user.destroy();
            return res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            return res.status(500).json({ message: 'Failed to delete user', error: error.message });
        }
    }
  
};

module.exports = userController;
