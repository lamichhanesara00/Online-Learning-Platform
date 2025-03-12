import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="w-60 h-full bg-gray-800 text-white flex flex-col p-4">
      <h2 className="text-xl font-bold mb-4">Dashboard</h2>
      <Link to="/dashboard" className="py-2 px-4 rounded hover:bg-gray-700">Dashboard</Link>
      <Link to="/dashboard/courses" className="py-2 px-4 rounded hover:bg-gray-700">Courses</Link>
      <Link to="/dashboard/profile" className="py-2 px-4 rounded hover:bg-gray-700">Profile</Link>
      <Link to="/dashboard/settings" className="py-2 px-4 rounded hover:bg-gray-700">Settings</Link>
      <Link to="/dashboard/chat" className="py-2 px-4 rounded hover:bg-gray-700">Chat</Link>
    </div>
  );
};

export default Sidebar;
