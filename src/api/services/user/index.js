const User = require('~models/User');
const userMessages = require('~constants/messages').error.user;

const getByQuery = async query => {
	const result = await User.find(query)
		.select({ password: 0 })
		.exec();
	return result;
};

const getWithPassword = async query => {
	const result = await User.find(query).exec();
	return result;
};

const getByIdWithPassword = async id => {
	const user = await getWithPassword({ _id: id });
	if (user.length > 0) return user[0];
	return {};
};

const getById = async id => {
	const user = await getByQuery({ _id: id });
	if (user.length > 0) return user[0];
	return {};
};

const verifyEmail = async email => {
	const user = await getByQuery({ email: email });

	if (user.length !== 0) {
		let error = new Error(userMessages.emailExists);
		error.status = 409;
		throw error;
	}
};

const verifyUserById = async id => {
	let user = await getById(id);

	if (!user._id) {
		let error = new Error(userMessages.invalidId);
		error.status = 401;
		throw error;
	}
};

const verifyUserByEmail = async email => {
	const user = await getWithPassword({ email: email });

	if (user.length !== 1) {
		let error = new Error(userMessages.invalidEmail);
		error.status = 401;
		throw error;
	}

	return user[0];
};

const createUser = async user => {
	const newUser = new User(user);
	const result = await newUser.save();
	return result;
};

const updateUser = async (id, updateOpts) => {
	await User.updateOne({ _id: id }, { $set: updateOpts }).exec();
};

const deleteUser = async id => {
	await User.deleteOne({ _id: id }).exec();
};

const deleteAllUsers = async () => {
	await User.deleteMany( { } ).exec();
}

const toCamelCase = unformattedString => {
	let firstLetter = unformattedString[0].toUpperCase();
	let formatedString = unformattedString.toLowerCase();
	formatedString = formatedString.replace(formatedString[0], firstLetter);
	
	return formatedString;
}

module.exports = {
	getById,
	getByQuery,
	getByIdWithPassword,
	getWithPassword,
	verifyEmail,
	verifyUserByEmail,
	verifyUserById,
	createUser,
	updateUser,
	deleteUser,
	deleteAllUsers,
	toCamelCase,
};
