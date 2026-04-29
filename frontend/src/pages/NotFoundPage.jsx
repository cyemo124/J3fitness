import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-light">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-8 text-center">
        Sorry, the page you're looking for doesn't exist.
      </p>
      <Link to="/" className="btn btn-primary">
        Go Back Home
      </Link>
    </div>
  );
}
