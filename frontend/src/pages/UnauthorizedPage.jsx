import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light">
      <div className="text-center card max-w-md">
        <h1 className="text-4xl font-bold text-danger mb-4">403</h1>
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-8">
          You don't have permission to access this resource. 
          If you believe this is an error, please contact support.
        </p>

        <div className="flex gap-4 justify-center">
          <Link to="/" className="btn btn-primary">
            Go Home
          </Link>
          <Link to="/dashboard" className="btn btn-secondary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
