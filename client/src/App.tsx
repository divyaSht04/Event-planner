import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context';
import { HomePage, DashboardPage, LoginPage, SignupPage, VerifyOTPPage, NotFound } from './pages';
import { Events, CreateEvent, EditEvent, EventDetails, MyEvents } from './pages/event-page';
import { ProtectedRoute, PublicOnlyRoute } from './components';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth/login" element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            } />
            <Route path="/auth/signup" element={
              <PublicOnlyRoute>
                <SignupPage />
              </PublicOnlyRoute>
            } />
            <Route path="/verify-otp" element={
              <PublicOnlyRoute>
                <VerifyOTPPage />
              </PublicOnlyRoute>
            } />
            
            <Route path="/events" element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            } />
            <Route path="/events/:id" element={
              <ProtectedRoute>
                <EventDetails />
              </ProtectedRoute>
            } />

            <Route 
              path="/events/my" 
              element={
                <ProtectedRoute>
                  <MyEvents />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/events/create" 
              element={
                <ProtectedRoute>
                  <CreateEvent />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/events/edit/:id" 
              element={
                <ProtectedRoute>
                  <EditEvent />
                </ProtectedRoute>
              } 
            />
            
            {/* Dashboard route */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
          
          <Toaster 
            position="top-right"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{}}
            toastOptions={{
              className: '',
              duration: 1500,
              style: {
                background: '#ffffffff',
                color: '#000000ff',
              },
              success: {
                duration: 2000,
                iconTheme: {
                  primary: '#45a916ff',
                  secondary: '#4524c9ff',
                },
              },
              error: {
                duration: 2500,
                iconTheme: {
                  primary: '#ff6b6b',
                  secondary: '#b93781ff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
