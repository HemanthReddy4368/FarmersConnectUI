// src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import logo from '../assets/logo.jpg';
import {
  HomeIcon,
  CloudIcon,
  UserCircleIcon,
  Cog6ToothIcon as CogIcon,
  ArrowRightOnRectangleIcon as LogoutIcon,
  Bars3Icon as MenuIcon,
  XMarkIcon as XIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    const ROLES = {
        FARMER: 'Farmer',
        BUYER: 'Buyer',
        ADMIN: 'Admin',
        WORKER: 'Worker'
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setDropdownOpen(false);
    };

    const isActivePath = (path) => location.pathname === path;

    const NavLink = ({ to, children, icon: Icon }) => (
        <Link
            to={to}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out
        ${isActivePath(to)
                ? 'bg-green-100 text-green-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
        >
            {Icon && <Icon className="h-5 w-5" />}
            <span>{children}</span>
        </Link>
    );

    const getRoleSpecificNavItems = () => {
        if (!user) return null;

        // Simplified: The "Home" link now serves as the main dashboard link.
        // We only add extra, non-dashboard links here.
        switch (user.role) {
            case ROLES.ADMIN:
                return <NavLink to="/all-farms" icon={BuildingStorefrontIcon}>All Farms</NavLink>;
            case ROLES.BUYER:
                return <NavLink to="/marketplace" icon={ShoppingBagIcon}>Marketplace</NavLink>;
            case ROLES.WORKER:
                 return <NavLink to="/work-orders" icon={ClipboardDocumentListIcon}>Work Orders</NavLink>;
            default:
                return null;
        }
    };

    return (
        <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <img src={logo} alt="Farmers Connect Logo" className="h-8 w-auto" />
                            <span className="ml-2 text-xl font-bold text-gray-800">
                                Farmers Connect
                            </span>
                        </Link>
                        <div className="hidden md:ml-6 md:flex md:space-x-2">
                            <NavLink to="/" icon={HomeIcon}>{user ? 'Dashboard' : 'Home'}</NavLink>
                            {user && <NavLink to="/weather" icon={CloudIcon}>Weather</NavLink>}
                            {getRoleSpecificNavItems()}
                        </div>
                    </div>

                    <div className="flex items-center">
                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
                                >
                                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                        <span className="text-green-700 font-bold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="hidden sm:block font-semibold">{user.name}</span>
                                    <ChevronDownIcon className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'transform rotate-180' : ''}`} />
                                </button>
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-100">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                            <p className="text-xs text-white px-2 py-0.5 rounded-full inline-block bg-green-500">{user.role}</p>
                                        </div>
                                        <div className="py-1">
                                            <Link to="/profile" className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setDropdownOpen(false)}>
                                                <UserCircleIcon className="h-5 w-5 mr-3 text-gray-500" /> Profile
                                            </Link>
                                            <Link to="/settings" className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setDropdownOpen(false)}>
                                                <CogIcon className="h-5 w-5 mr-3 text-gray-500" /> Settings
                                            </Link>
                                        </div>
                                        <div className="py-1 border-t border-gray-100">
                                            <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                                <LogoutIcon className="h-5 w-5 mr-3" /> Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center space-x-2">
                                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-green-600 transition-colors">
                                    Login
                                </Link>
                                <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                                    Register
                                </Link>
                            </div>
                        )}
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden ml-4 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500">
                            {mobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <NavLink to="/" icon={HomeIcon}>{user ? 'Dashboard' : 'Home'}</NavLink>
                        {user && <NavLink to="/weather" icon={CloudIcon}>Weather</NavLink>}
                        {getRoleSpecificNavItems()}
                    </div>
                    <div className="pt-4 pb-3 border-t border-gray-200">
                        {user ? (
                            <div className="px-4">
                                <Link to="/profile" className="flex items-center w-full py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                                    <UserCircleIcon className="h-6 w-6 mr-3 text-gray-500" /> Profile
                                </Link>
                                <Link to="/settings" className="flex items-center w-full py-2 mt-1 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                                    <CogIcon className="h-6 w-6 mr-3 text-gray-500" /> Settings
                                </Link>
                                <button onClick={handleLogout} className="flex items-center w-full py-2 mt-1 text-base font-medium text-red-600 hover:bg-red-50 rounded-md">
                                    <LogoutIcon className="h-6 w-6 mr-3" /> Logout
                                </button>
                            </div>
                        ) : (
                            <div className="px-2 space-y-1">
                                <Link to="/login" className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Login</Link>
                                <Link to="/register" className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-green-600 hover:bg-green-700">Register</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};
export default Navbar;