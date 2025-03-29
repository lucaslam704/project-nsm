import Sidebar from "./components/Sidebar";
import Feed from "./components/Feed";
import RightPanel from "./components/RightPanel";

export default function App() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <Feed />
      <RightPanel />
    </div>
  );
}