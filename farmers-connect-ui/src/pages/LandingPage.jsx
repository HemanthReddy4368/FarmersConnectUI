// src/pages/LandingPage.jsx (NEW FILE)
// This is a new, dedicated component for the guest landing page.
import { Link } from 'react-router-dom';
import {
    SparklesIcon,
    ChartBarIcon,
    GlobeAltIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import heroImage from '../assets/logo.jpg'; // Make sure to add a nice hero image to your assets
import logo from '../assets/logo.jpg';

const LandingPage = () => {
    const features = [
        {
            name: 'Smart Farm Management',
            description: 'Use data-driven tools to manage crops, track yields, and optimize your farm\'s performance from a single dashboard.',
            icon: ChartBarIcon,
        },
        {
            name: 'Direct Market Access',
            description: 'Bypass intermediaries. Connect directly with buyers to get fair prices and build lasting business relationships.',
            icon: GlobeAltIcon,
        },
        {
            name: 'AI-Powered Insights',
            description: 'Leverage artificial intelligence to get weather forecasts, market trends, and suggestions to protect your crops.',
            icon: SparklesIcon,
        },
        {
            name: 'Secure & Trusted',
            description: 'A reliable platform with secure transactions and a community of verified farmers and buyers.',
            icon: ShieldCheckIcon,
        },
    ];

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <main>
                <div className="relative">
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gray-100" />
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="relative shadow-xl sm:rounded-2xl sm:overflow-hidden">
                            <div className="absolute inset-0">
                                <img
                                    className="h-full w-full object-cover"
                                    src={heroImage}
                                    alt="Lush green farm"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-green-800 to-green-600 mix-blend-multiply" />
                            </div>
                            <div className="relative px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8">
                                <h1 className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                                    <span className="block text-white">The Future of Farming</span>
                                    <span className="block text-green-200">Is Connected</span>
                                </h1>
                                <p className="mt-6 max-w-lg mx-auto text-center text-xl text-green-100 sm:max-w-3xl">
                                    Empowering farmers with the technology to grow smarter, sell better, and connect with a global market.
                                </p>
                                <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
                                    <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
                                        <Link
                                            to="/register"
                                            className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-green-700 bg-white hover:bg-green-50 sm:px-8"
                                        >
                                            Get started
                                        </Link>
                                        <Link
                                            to="/login"
                                            className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-500 bg-opacity-80 hover:bg-opacity-100 sm:px-8"
                                        >
                                            Sign In
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feature Section */}
                <div className="bg-gray-100">
                    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
                        <div className="max-w-3xl mx-auto text-center">
                            <h2 className="text-3xl font-extrabold text-gray-900">Everything you need to grow</h2>
                            <p className="mt-4 text-lg text-gray-500">
                                Farmers Connect is more than an app! it's your partner in modern agriculture.
                            </p>
                        </div>
                        <dl className="mt-12 space-y-10 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-8">
                            {features.map((feature) => (
                                <div key={feature.name} className="relative">
                                    <dt>
                                        <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-600 text-white">
                                            <feature.icon className="h-6 w-6" aria-hidden="true" />
                                        </div>
                                        <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                                    </dt>
                                    <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-white">
                    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8 lg:flex lg:items-center lg:justify-between">
                        <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            <span className="block">Ready to get started?</span>
                            <span className="block text-green-600 -mt-1">Join the community today.</span>
                        </h2>
                        <div className="mt-6 space-y-4 sm:space-y-0 sm:flex sm:space-x-5">
                            <Link
                                to="/register"
                                className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:text-lg"
                            >
                                Create Account
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-50" aria-labelledby="footer-heading">
                <h2 id="footer-heading" className="sr-only">
                    Footer
                </h2>
                <div className="max-w-7xl mx-auto pt-12 pb-8 px-4 sm:px-6 lg:px-8">
                    <div className="mt-8 border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
                        <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
                            &copy; {new Date().getFullYear()} Farmers Connect. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;