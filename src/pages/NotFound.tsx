
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 text-primary">404</h1>
        <p className="text-xl text-foreground mb-4">Oops! Página não encontrada</p>
        <Link to="/" className="text-primary hover:text-primary/80 underline">
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
