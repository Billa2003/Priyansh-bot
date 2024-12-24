module.exports.config = {
	name: "grouplockname",
	version: "1.0.0",
	hasPermssion: 2, // Only admins can use this command
	credits: "Amir",
	description: "Lock your group name",
	commandCategory: "Box",
	usages: "grouplockname [on/off] [group name]",
	cooldowns: 5,
	dependencies: []
};

const lockedGroups = {}; // To store locked group names

module.exports.run = async function({ api, event, args }) {
	const threadID = event.threadID;
	const command = args[0]?.toLowerCase();
	const groupName = args.slice(1).join(" ");

	if (command === "on") {
		if (!groupName) {
			return api.sendMessage("❌ Please provide a group name to lock.", threadID, event.messageID);
		}

		// Lock the group name
		lockedGroups[threadID] = groupName;
		api.setTitle(groupName, threadID, (err) => {
			if (err) {
				return api.sendMessage("❌ Failed to set group name. Please try again.", threadID, event.messageID);
			}
			api.sendMessage(`✅ Group name locked as: "${groupName}"`, threadID, event.messageID);
		});
	} else if (command === "off") {
		// Unlock the group name
		if (!lockedGroups[threadID]) {
			return api.sendMessage("❌ No group name is locked for this group.", threadID, event.messageID);
		}
		delete lockedGroups[threadID];
		api.sendMessage("✅ Group name lock has been disabled.", threadID, event.messageID);
	} else {
		api.sendMessage("❌ Invalid command. Use 'on' to lock and 'off' to unlock.", threadID, event.messageID);
	}
};

module.exports.handleEvent = function({ api, event }) {
	if (event.logMessageType === "log:thread-name") {
		const threadID = event.threadID;
		const lockedName = lockedGroups[threadID];

		// If the group name is locked, revert the change
		if (lockedName && event.logMessageData.name !== lockedName) {
			api.setTitle(lockedName, threadID, (err) => {
				if (!err) {
					api.sendMessage("❌ Group name change reverted.", threadID);
				}
			});
		}
	}
};
