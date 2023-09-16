import { useGetUserGuildsQuery } from "../users/usersApi";

const Dashboard = () => {
  const { data, isLoading } = useGetUserGuildsQuery();
  return <> {isLoading ? <>Loading...</> : data ? <></> : null}</>;
};

export default Dashboard;
