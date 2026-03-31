import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [authLoading, setAuthLoading] = useState(true);

  const logout = async () => {
		const response = await fetch("http://localhost:8000/auth/logout", {
      method: "POST",
      credentials: "include",
    });

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.detail || "Failed to log out.");
		}

		setUser(null);
		return data;
	};

  const login = async ({ email, password }) => {
    const response = await fetch("http://localhost:8000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to log in.");
    }

    const nextUser = data?.user ?? null;
    setUser(nextUser);
    return data;
  };

	const signup = async ({ email, password }) => {
		const response = await fetch("http://localhost:8000/auth/signup", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({ email, password }),
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.detail || "Failed to create account.");
		}

		const nextUser = data?.user ?? null;
		setUser(nextUser);
		return data;
	};

	const refreshAuth = async () => {
		try {
			const response = await fetch("http://localhost:8000/auth/me", {
				method: "GET",
				credentials: "include",
			});

			if (!response.ok) {
				setUser(null);
				return null;
			}

			const data = await response.json();
			const nextUser = data?.user ?? null;
			setUser(nextUser);
			return nextUser;
		} catch (error) {
			setUser(null);
			return null;
		} finally {
			setAuthLoading(false);
		}
	};

	useEffect(() => {
		refreshAuth();
	}, []);

	return (
		<AuthContext.Provider
			value={{
				user,
				authLoading,
				isAuthenticated: Boolean(user),
				signup,
        login,
        logout,
				refreshAuth,
				setUser,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
};

export default AuthContext;

