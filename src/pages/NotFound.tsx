
import { useLocation } from "react-router-dom";
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
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 text-green-700">404</h1>
        <p className="text-xl text-green-600 mb-4">Oops! Página não encontrada</p>
        <a href="/" className="text-green-500 hover:text-green-700 underline">
          Voltar ao Início
        </a>
      </div>
    </div>
  );
};

export default NotFound;
