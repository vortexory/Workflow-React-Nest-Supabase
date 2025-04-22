import { Provider } from "react-redux";
import { store } from "./store/store";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Editor from "./pages/Editor";
import WorkflowList from "./pages/WorkflowList";
import Signup from "./auth/Signup";
import Login from "./auth/Login";
import CheckEmail from "./auth/CheckEmail";
import "reactflow/dist/style.css";
import { PrivateRoute } from "./auth/PrivateRoute";
import { AuthProvider } from "./auth/AuthContext";
import AuthCallback from "./auth/Callback";
import Layout from "./layout";

function AppRoutes() {
  const location = useLocation();
  const authPages = ["/login", "/signup", "/check", "/auth/callback"];

  const isAuthPage = authPages.includes(location.pathname);

  return (
    <>
      {isAuthPage ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/check" element={<CheckEmail />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      ) : (
        <Layout>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<WorkflowList />} />
              <Route path="/editor" element={<Editor />} />
              <Route path="/editor/:id" element={<Editor />} />
              <Route path="/editor/:id/executions/:id" element={<Editor />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Layout>
      )}
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  );
}
