import { useMemo } from "react";
import { useSelector } from "react-redux";

import {
  selectClientUser,
  selectClientId,
  selectUserCount,
  selectVersion,
} from "../features/client/clientSlice";

export const useClient = () => {
  const user = useSelector(selectClientUser);
  const clientId = useSelector(selectClientId);
  const userCount = useSelector(selectUserCount);
  const version = useSelector(selectVersion);

  return useMemo(() => ({ user, clientId, userCount, version }), [
    user,
    clientId,
    userCount,
    version,
  ]);
};
