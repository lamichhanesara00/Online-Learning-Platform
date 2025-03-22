import { NavLink } from "react-router-dom";
import { FaGraduationCap } from "react-icons/fa";

const Navigation = () => {
  return (
    <nav>
      <ul>
        <li>
          <NavLink to="/home" className="nav-link">
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/about" className="nav-link">
            About
          </NavLink>
        </li>
        <li>
          <NavLink to="/contact" className="nav-link">
            Contact
          </NavLink>
        </li>
        {/* Add this link to your navigation menu for logged-in users */}
        <li>
          <NavLink to="/my-courses" className="nav-link">
            <FaGraduationCap className="nav-icon" />
            My Courses
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
