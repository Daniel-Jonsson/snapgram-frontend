enum requestType {
	Pending = "pending",
    Accepted = "accepted",
    Declined = "declined",
}

export type FriendRequest = {
	sender: string;
	receiver: string;
	status: requestType;
    createdAt: Date;
};
