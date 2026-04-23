const crypto = require("crypto");
const ApiKey = require("../models/ApiKey");

exports.createKey = async (req, res) => {
	try {
		const { label } = req.body;
		const rawKey = "sk_" + crypto.randomBytes(24).toString("hex");
		const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");
		const keyPrefix = rawKey.substring(0, 10);

		await ApiKey.create({
			label,
			hashedKey,
			keyPrefix,
			isActive: req.user.isActive,
			createdBy: req.user.id
		});

		res.status(201).json({ message: "API Key Created, PLEASE COPY THIS, IT SHOWS ONLY ONCE HERE!", rawKey });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

exports.listKeys = async (req, res) => {
	try {
		const keys = await ApiKey.find({ isActive: true })
			.select("-hashedKey")
			.populate("createdBy", "username")
			.lean();
		res.json(keys);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

exports.revokeKey = async (req, res) => {
	try {
		const key = await ApiKey.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
		if (!key) return res.status(404).json({ error: "Key not found" });
		res.json({ message: "Key revoked" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
