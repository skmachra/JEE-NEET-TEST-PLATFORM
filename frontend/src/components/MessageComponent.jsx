import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const Message = ({ type, message, duration = 3000, onClose }) => {
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setVisible(false);
			if (onClose) onClose();
		}, duration);

		return () => clearTimeout(timer);
	}, [duration, onClose]);

	if (!visible) return null;

	const bgColor = {
		success: "bg-green-500",
		error: "bg-red-500",
		info: "bg-blue-500",
		warning: "bg-yellow-500",
	}[type] || "bg-gray-500";

	return (
		<div
			className={`fixed top-16 left-1/2 transform -translate-x-1/2 z-50 ${bgColor} text-white px-4 py-2 rounded shadow-md flex items-center justify-between`}
			role="alert"
		>
			<span>{message}</span>
			<button
				className="ml-4 text-white hover:text-gray-200"
				onClick={() => {
					setVisible(false);
					if (onClose) onClose();
				}}
			>
				&times;
			</button>
		</div>
	);
};

Message.propTypes = {
	type: PropTypes.oneOf(["success", "error", "info", "warning"]),
	message: PropTypes.string.isRequired,
	duration: PropTypes.number,
	onClose: PropTypes.func,
};

export default Message;
