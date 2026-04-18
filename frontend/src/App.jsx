import { useAuth0 } from "@auth0/auth0-react";

function App() {
  const {
    loginWithRedirect,
    logout,
    user,
    isAuthenticated,
    isLoading,
    error,
  } = useAuth0();

  console.log("Auth0 state:", {
    isAuthenticated,
    isLoading,
    user,
    error,
  });

  if (isLoading) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>Green Habit Coach</h1>

      {error && (
        <pre style={{ color: "red", whiteSpace: "pre-wrap" }}>
          {error.message}
        </pre>
      )}

      {isAuthenticated ? (
        <>
          <p>Logged in as: {user?.name || user?.email}</p>
          <button
            onClick={() =>
              logout({
                logoutParams: {
                  returnTo: window.location.origin,
                },
              })
            }
          >
            Log out
          </button>
        </>
      ) : (
        <button
          onClick={() => {
            console.log("login button clicked");
            loginWithRedirect();
          }}
        >
          Log in
        </button>
      )}
    </div>
  );
}

export default App;