import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { UserContextProvider } from "./context/UserContext";
import { CourseContextProvider } from "./context/CourseContext"; // ✅ Import CourseContextProvider

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <UserContextProvider>
      <CourseContextProvider>
        <App />
      </CourseContextProvider>
    </UserContextProvider>
  </Router>
);
