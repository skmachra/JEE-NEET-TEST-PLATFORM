import { Link } from "react-router-dom";

function AdminDashboard() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid gap-4">
        {/* Link to Manage Tests */}
        <Link
          to="/admin/tests"
          className="p-4 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
        >
          Manage Tests
        </Link>

        {/* Link to Manage Questions */}
        <Link
          to="/admin/questions"
          className="p-4 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600"
        >
          Manage Questions
        </Link>

        {/* Link to Reports (Optional) */}
        <Link
          to="/admin"
          className="p-4 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600"
        >
          View Reports
        </Link>
      </div>
    </div>
  );
}

export default AdminDashboard;

