export default function Feed() {
    return (
      <div className="flex-1 p-5">
        <h2 className="text-xl font-bold mb-5">Home</h2>
        <div className="space-y-5">
          <Post username="User1" text="This is a sample post!" />
          <Post username="User2" text="Loving this new dashboard!" />
        </div>
      </div>
    );
  }
  
  function Post({ username, text }) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold">{username}</h3>
        <p className="text-gray-700">{text}</p>
      </div>
    );
  }
  