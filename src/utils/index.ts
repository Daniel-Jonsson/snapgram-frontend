export function getInitials(firstName: string, lastName: string) {
	const initials =
		(firstName[0]?.toUpperCase() || "A") +
		(lastName[0]?.toUpperCase() || "U"); // If no user then use AU as Anonymous User
	return initials;
}
