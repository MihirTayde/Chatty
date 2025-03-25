import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./assets/login";
import SignupPage from "./assets/signup";
import Home from "./assets/Home";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/SignUp" element={<SignupPage />} />
        <Route path="/Home" element={<Home></Home>}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
