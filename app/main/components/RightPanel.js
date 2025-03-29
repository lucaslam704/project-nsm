export default function RightPanel() {
    return (
      <div className="w-1/4 bg-white p-5 shadow-lg">
        <h2 className="text-xl font-bold mb-5">Notifications</h2>
        <div className="space-y-4">
          <Notification text="User3 liked your post!" />
          <Notification text="New friend request from User4!" />
        </div>
      </div>
    );
  }
  
  function Notification({ text }) {
    return (
      <div className="bg-gray-100 p-3 rounded-lg">{text}</div>
    );
  }
  