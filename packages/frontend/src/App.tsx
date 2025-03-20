import { Provider } from "react-redux";
import { store } from "./store/store";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Editor from "./pages/Editor";
import WorkflowList from "./pages/WorkflowList";
import Signup from "./auth/Signup";
import Login from "./auth/Login";
import "reactflow/dist/style.css";
// import { PrivateRoute } from "./auth/PrivateRoute";
// import { AuthProvider } from "./auth/AuthContext";
// import AuthCallback from "./auth/Callback";

export default function App() {
  return (
    <Provider store={store}>
      {/* <AuthProvider> */}
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* <Route path="/auth/callback" element={<AuthCallback />} /> */}
            {/* <Route element={<PrivateRoute />}> */}
              <Route path="/" element={<WorkflowList />} />
              <Route path="/editor" element={<Editor />} />
              <Route path="/editor/:id" element={<Editor />} />{" "}
              <Route path="/editor/:id/executions/:id" element={<Editor />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            {/* </Route> */}
          </Routes>
        </BrowserRouter>
      {/* </AuthProvider> */}
    </Provider>
  );
}
