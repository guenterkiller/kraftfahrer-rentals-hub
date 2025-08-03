import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function FahrerWerden() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to /fahrer-registrierung
    navigate("/fahrer-registrierung", { replace: true });
  }, [navigate]);

  return null;
}

