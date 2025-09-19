import { Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Input from "./pages/Input";

function App() {
  return (
    <Routes>
      <Route path="/service" element={<Home />} />
      <Route path="/" element={<Input />} />
    </Routes>
  );
}

export default App;
