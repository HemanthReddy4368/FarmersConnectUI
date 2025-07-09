// src/pages/Home.jsx (UPDATED)
// This component now acts as a router, showing the correct dashboard or the new LandingPage.
import { useAuth } from '../context/AuthContext';
import FarmManagement from './FarmManagement';
import Admin from './Admin';
import LandingPage from './LandingPage'; // The new landing page for guests

const Home = () => {
  const { user, isLoading } = useAuth();

  const ROLES = {
    FARMER: 'Farmer',
    BUYER: 'Buyer',
    ADMIN: 'Admin',
    WORKER: 'Worker'
  };

  // While auth state is loading, show a loader
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
      </div>
    );
  }

  // Once loading is done, decide which component to render
  if (!user) {
    return <LandingPage />;
  }

  switch (user.role) {
    case ROLES.FARMER:
      // For farmers, the home page IS the farm management dashboard
      return <FarmManagement />;
    
    case ROLES.ADMIN:
      // For admins, the home page IS the admin panel
      return <Admin />;

    case ROLES.BUYER:
      // Placeholder for Buyer's dashboard
      return (
        <div className="text-center p-10">
          <h1 className="text-3xl font-bold">Buyer Dashboard</h1>
          <p className="mt-4">Marketplace coming soon!</p>
        </div>
      );

    case ROLES.WORKER:
        // Placeholder for Worker's dashboard
        return (
            <div className="text-center p-10">
                <h1 className="text-3xl font-bold">Worker Dashboard</h1>
                <p className="mt-4">Work order management coming soon!</p>
            </div>
        );

    default:
      // Fallback for any other case
      return <LandingPage />;
  }
};

export default Home;