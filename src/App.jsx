import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { ProtectedLayout, AuthProtectedLayout } from "./routes/RoutesLayout";
import { ADMIN_ROUTES, AUTH_ROUTES, HR_ROUTES, PM_ROUTES, EMP_ROUTES } from "./routes";
import MainLayout from "./components/layout";


function App() {
  return (
    <BrowserRouter basename="/login">
      <Routes>

        {/* ── Auth routes (redirect to "/" if already logged in) ─────────── */}
        <Route element={<AuthProtectedLayout />}>
          {AUTH_ROUTES?.map((route) => (
            <Route
              key={route.id}
              path={route.path}
              element={route.component}
            />
          ))}
        </Route>

        {/* ── Protected routes (redirect to "/login" if not logged in) ───── */}
        <Route element={<ProtectedLayout />}>

          {/* Admin */}
          {ADMIN_ROUTES?.map((route) => (
            <Route
              key={route.id}
              path={route.path}
              element={
                route.component
                  ? <MainLayout>{route.component}</MainLayout>
                  : null
              }
            />
          ))}

          {/* HR */}
          {HR_ROUTES?.map((route) => (
            <Route
              key={route.id}
              path={route.path}
              element={
                route.component
                  ? <MainLayout>{route.component}</MainLayout>
                  : null
              }
            />
          ))}

          {/* Project Manager */}
          {PM_ROUTES?.map((route) => (
            <Route
              key={route.id}
              path={route.path}
              element={
                route.component
                  ? <MainLayout>{route.component}</MainLayout>
                  : null
              }
            />
          ))}

          {/* Employee */}
          {EMP_ROUTES?.map((route) => (
            <Route
              key={route.id}
              path={route.path}
              element={
                route.component
                  ? <MainLayout>{route.component}</MainLayout>
                  : null
              }
            />
          ))}

         
          <Route
            path="*"
            element={
              <MainLayout>
                <div>Page Not Found</div>
              </MainLayout>
            }
          />

        </Route>

       
       

      </Routes>
    </BrowserRouter>
  );
}

export default App;