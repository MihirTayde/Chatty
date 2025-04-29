import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./assets/Home";
import LoginPage from "./assets/LoginPage";
import SignupPage from "./assets/SignupPage";
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/Home" element={<Home></Home>}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
