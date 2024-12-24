module.exports.config = {
    name: "grouplockname",
    version: "1.0.0",
    hasPermssion: 2,
    credits: "Mian Amir",
    description: "Lock group name and prevent changes",
    commandCategory: "Box",
    usages: "grouplockname [on/off] [name]",
    cooldowns: 5
};

let lockedGroups = {};

module.exports.run = async function({ api, event, args }) {
    const { threadID, senderID, messageID } = event;
    const command = args[0];
    const lockValue = args.slice(1).join(" ");

    if (!["on", "off"].includes(command)) {
        return api.sendMessage("Please use 'on' or 'off' to enable or disable the group name lock.", threadID, messageID);
    }

    if (command === "on") {
        if (!lockValue) {
            return api.sendMessage("You need to provide a name to lock the group as.", threadID, messageID);
        }
        lockedGroups[threadID] = lockValue;
        api.setTitle(lockValue, threadID, (err) => {
            if (err) {
                return api.sendMessage("❌ Failed to lock the group name.", threadID, messageID);
            }
            api.sendMessage(`✅ Group name successfully locked as: ${lockValue}`, threadID, messageID);
        });
    } else if (command === "off") {
        delete lockedGroups[threadID];
        api.sendMessage("✅ Group name lock has been disabled.", threadID, messageID);
    }
};

module.exports.handleEvent = async function({ api, event }) {
    const { threadID, logMessageType } = event;

    if (logMessageType === "log:thread-name") {
        const lockedName = lockedGroups[threadID];
        if (lockedName) {
            api.setTitle(lockedName, threadID, (err) => {
                if (!err) {
                    api.sendMessage("❌ Group name change reverted to the locked name.", threadID);
                }
            });
        }
    }
};
