export default function Sidebar() {
    return (
      <div className="w-1/5 bg-white p-5 shadow-lg">
        <h2 className="text-xl font-bold mb-5">Dashboard</h2>
        <ul>
          <li className="mb-4 text-gray-700 hover:text-blue-500 cursor-pointer">Home</li>
          <li className="mb-4 text-gray-700 hover:text-blue-500 cursor-pointer">Messages</li>
          <li className="mb-4 text-gray-700 hover:text-blue-500 cursor-pointer">Notifications</li>
          <li className="mb-4 text-gray-700 hover:text-blue-500 cursor-pointer">Profile</li>
        </ul>
      </div>
    );
  }