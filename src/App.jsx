import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
//import { ProtectedLayout } from "./routes/RoutesLayout";
import { ADMIN_ROUTES, AUTH_ROUTES, HR_ROUTES, PM_ROUTES } from "./routes";
import MainLayout from "./components/layout";



function App() {
 

  return (
    <BrowserRouter>
      <Routes>
         {AUTH_ROUTES?.map((route) => {
          // If route has children, create nested routes
          if (route.children) {
            return (
              <Route
                key={route.id}
                path={route.path}
                element={
                  route.component
                }
              />
            );
          }
          // Regular route without children
          return (
            <Route key={route.id} path={route.path} element={route.component} />
          );
        })} 
        
        <Route >
          { ADMIN_ROUTES?.map((route) => (
            <Route
              key={route.id}
              path={route.path}
              element={
                route.component ? (
                  <MainLayout>{route.component}</MainLayout>
                ) : null
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
        {/* HR routes */}
        <Route>
          {HR_ROUTES?.map((route) => (
            <Route
              key={route.id}
              path={route.path}
              element={
                route.component ? (
                  <MainLayout>{route.component}</MainLayout>
                ) : null
              }
            />
          ))}
        </Route>
        {/* PM routes */}
        <Route>
          {PM_ROUTES?.map((route) => (
            <Route
              key={route.id}
              path={route.path}
              element={
                route.component ? (
                  <MainLayout>{route.component}</MainLayout>
                ) : null
              }
            />
          ))}
        </Route>
      </Routes>

    </BrowserRouter>
  );
}

export default App;
