export type User = {
	_id: string;
	username: string;
	email: string;
	admin: boolean;
	firstname: string;
	lastname: string;
	follows: Array<User>;
	createdAt: string;
	description?: string;
	profilePicture?: string;
};

export type userLogin = {
    email: string,
    password: string,
}

export type userRegister = {
	firstname: string,
	lastname: string,
    username: string,
	email: string,
    password: string,
    confirmPassword: string,
    admin: boolean,
};

export type userUpdate = {
    firstname: string,
    lastname: string,
    email: string,
    description?: string,
    profilePicture?: string,
	admin: boolean,
}