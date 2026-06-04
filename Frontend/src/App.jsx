import { Route, Routes } from "react-router-dom";
import OrderManagement from "./pages/OrderManagement";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<OrderManagement />} />
      <Route path="/orders/*" element={<OrderManagement />} />
    </Routes>
  );
};

export default App;
