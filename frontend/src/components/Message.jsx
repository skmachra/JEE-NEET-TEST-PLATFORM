import React, { createContext, useState, useContext, useCallback } from "react";
import Message from "./MessageComponent"; // The Message component from earlier

const MessageContext = createContext();

export const useMessage = () => useContext(MessageContext);

export const MessageProvider = ({ children }) => {
	const [messageProps, setMessageProps] = useState(null);

	const showMessage = useCallback((type, message, duration = 3000) => {
		setMessageProps({ type, message, duration });
	}, []);

	const closeMessage = () => setMessageProps(null);

	return (
		<MessageContext.Provider value={showMessage}>
			{children}
			{messageProps && (
				<Message
					type={messageProps.type}
					message={messageProps.message}
					duration={messageProps.duration}
					onClose={closeMessage}
				/>
			)}
		</MessageContext.Provider>
	);
};
