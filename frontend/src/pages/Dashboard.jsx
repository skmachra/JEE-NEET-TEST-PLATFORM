import React from "react";

const Dashboard = () => {
    const {isLoggedIn, user} = useAuth();
    if (!isLoggedIn) {
        return <p>Please log in to access your dashboard.</p>;
    }
    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome to your dashboard</p>
        </div>
    );
}

export default Dashboard;