import { CssBaseline, GlobalStyles, ThemeProvider } from "@mui/material";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Commands from "./features/commands/Commands";
import MainLayout from "./layouts/MainLayout";
import { defaultTheme } from "./theme";
import { useGetCurrentUserMutation } from "./features/users/usersApi";
import Home from "./features/home/Home";
import Dashboard from "./features/dashboard/Dashboard";

function App() {
  const dispatch = useDispatch();
  const [getCurrentUser] = useGetCurrentUserMutation();

  // Here we are fetching the logged in user.
  useEffect(() => {
    getCurrentUser();
  }, [dispatch, getCurrentUser]);

  return (
    <>
      <ThemeProvider theme={defaultTheme}>
        <GlobalStyles
          styles={{ ul: { margin: 0, padding: 0, listStyle: "none" } }}
        />
        <CssBaseline />

        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/commands" element={<Commands />} />
              <Route path="/dashboard">
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </>
  );
}

export default App;
