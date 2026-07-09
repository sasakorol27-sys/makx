import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  
  if (user === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-[3px] border-muted border-t-primary animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Wird geladen…</p>
        </div>
      </div>
    );
  }
  
  if (user === false) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
}
