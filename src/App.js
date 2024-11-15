import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Login from "./auth/Login";
import Register from "./auth/Register";
import AddExpense from "./components/AddExpense";
import Settings from "./components/Settings";
import Records from "./components/Records";
import Lend from "./components/Lend";
import Shares from "./components/Shares";
import RoscaManager from "./components/RoscaManager";
import RoscaDoc from "./components/RoscaDoc";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex justify-end p-4">
        </div>
        <Routes>
          <Route path="/" element={<Sidebar />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/add-expense" element={<AddExpense />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/records" element={<Records />} />
          <Route path="/lend" element={<Lend />} />
          <Route path="/shares" element={<Shares />} />
          <Route path="/rosca" element={<RoscaManager />} />
          <Route path="/rosca/:roscaId" element={<RoscaDoc />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
