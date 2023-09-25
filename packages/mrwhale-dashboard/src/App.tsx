import { CssBaseline, GlobalStyles, ThemeProvider } from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Commands from "./features/commands/Commands";
import MainLayout from "./layouts/MainLayout";
import { defaultTheme } from "./theme";
import { useGetCurrentUserMutation } from "./features/users/usersApi";
import Home from "./features/home/Home";
import Dashboard from "./features/dashboard/Dashboard";
import PrivateRoute from "./shared/PrivateRoute";
import ManageGuild from "./features/dashboard/manage/ManageGuild";
import { selectIsInitialLoad } from "./features/auth/authSlice";
import Loading from "./components/Loading";
import { useGetClientInfoMutation } from "./features/client/clientApi";
import PrivacyPolicy from "./features/legal/PrivacyPolicy";

function App() {
  const dispatch = useDispatch();
  const isInitialLoad = useSelector(selectIsInitialLoad);
  const [getCurrentUser] = useGetCurrentUserMutation();
  const [getClientInfo] = useGetClientInfoMutation();

  // Here we are fetching the logged in user.
  useEffect(() => {
    getClientInfo();
    getCurrentUser();
  }, [dispatch, getClientInfo, getCurrentUser]);

  if (isInitialLoad) {
    return <Loading />;
  }

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
              <Route path="/dashboard" element={<PrivateRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route
                  path="/dashboard/manage/:guildId"
                  element={<ManageGuild />}
                />
              </Route>
              <Route path="/privacy" element={<PrivacyPolicy />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </>
  );
}

export default App;
