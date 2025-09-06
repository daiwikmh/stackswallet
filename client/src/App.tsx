import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import LandingPage from './components/landing/landing';
import DashboardPage from './components/dashboard/dashboard/page';
import SystemsPage from './components/dashboard/systems/page';
import DelegationPage from './components/delegation/page';
import { StacksWalletProvider } from './contexts/StacksWalletContext';

const App: React.FC = () => {
    return (
        <StacksWalletProvider>
            <Router>
                <Routes>
                    {/* <Route path="/" element={<FingerprintAuth />} />  */}

                    <Route path="/" element={<LandingPage />} /> 
                   
                    <Route path="/dashboard" element={<DashboardPage/>} />
                    <Route path="/systems" element={<SystemsPage/>} />
                    <Route path="/delegation" element={<DelegationPage/>} />
                </Routes>
            </Router>
        </StacksWalletProvider>
    );
};

export default App;