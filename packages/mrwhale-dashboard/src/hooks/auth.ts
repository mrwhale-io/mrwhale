import { useMemo } from "react";
import { useSelector } from "react-redux";

import {
  selectCurrentUser,
  selectIsAuthenticated,
} from "../features/auth/authSlice";

export const useAuth = () => {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return useMemo(() => ({ user, isAuthenticated }), [user, isAuthenticated]);
};
