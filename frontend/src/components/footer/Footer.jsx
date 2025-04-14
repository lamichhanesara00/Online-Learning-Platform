import "./footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <p>
        &copy; {new Date().getFullYear()} Online Learning. All Right Reserved.
      </p>
    </footer>
  );
};

export default Footer;
