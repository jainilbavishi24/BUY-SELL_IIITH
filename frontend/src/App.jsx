import { useEffect, useState, createContext } from "react";
import { Box, ChakraProvider } from "@chakra-ui/react";
import {
  Route,
  Routes,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";
import theme from "./theme";
import { AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import { useToast } from "@chakra-ui/react";

import CreatePage from "./pages/CreatePage";
import HomePage from "./pages/SearchPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Navbar from "./components/Navbar";
import MyCartPage from "./pages/MyCartPage";
import MyItemsPage from "./pages/MyItemsPage";
import ProfilePage from "./pages/ProfilePage";
import ItemPage from "./pages/ItemPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import DeliverItemsPage from "./pages/DeliverItemsPage";
import FloatingChatBot from "./components/FloatingChatBot";

export const ChatContext = createContext({
  isUserChatOpen: false,
  setIsUserChatOpen: () => {},
  activeConversationId: null,
  setActiveConversationId: () => {},
});

function ProtectedRoute({ element, isAuth }) {
  const location = useLocation();
  return isAuth ? element : <Navigate to="/login" state={{ from: location }} />;
}

function CASCallback({ onLogin }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userId = params.get("userId");
    const error = params.get("error");

    if (error) {
      navigate("/login", { state: { error } });
      return;
    }

    if (token && userId) {
      localStorage.setItem("authToken", token);
      localStorage.setItem("userId", userId);
      onLogin();

      // Fetch user profile to determine redirect
      const checkUserProfile = async () => {
        try {
          const res = await fetch(`/api/user/${userId}/profile`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await res.json();

          if (data.success) {
            const user = data.user;
            // Check if profile is complete
            const isProfileComplete = user.fname && user.lname && user.age && user.contactNo && user.contactNo !== "0000000000";

            if (!isProfileComplete) {
              // New user or incomplete profile -> redirect to profile page
              navigate("/profile");
            } else {
              // Existing user with complete profile -> redirect to marketplace
              navigate("/");
            }
          } else {
            // If can't fetch profile, default to profile page
            navigate("/profile");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          navigate("/profile");
        }
      };

      checkUserProfile();
    } else {
      navigate("/login");
    }
  }, [location, navigate, onLogin]);

  return null;
}

function App() {
  const location = useLocation();
  const hideNavbarRoutes = ["/login", "/signup", "/auth/cas/callback"];

  const [isAuth, setIsAuth] = useState(() => {
    return !!localStorage.getItem("authToken");
  });

  const [socket, setSocket] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const toast = useToast();
  const [isUserChatOpen, setIsUserChatOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [notificationPreview, setNotificationPreview] = useState(null);

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuth(!!localStorage.getItem("authToken"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (!isAuth) return;
    const s = io("http://localhost:5000", {
      auth: { token: localStorage.getItem("authToken") },
      transports: ["websocket"]
    });
    setSocket(s);
    s.on("chat:message", (msg) => {
      setLastMessage(msg);
      // If chat modal is not open or not focused on this conversation, show custom notification
      if (!isUserChatOpen || activeConversationId !== msg.conversationId) {
        setNotificationPreview({
          conversationId: msg.conversationId,
          text: msg.text || msg.content,
          sender: msg.sender && (msg.sender.fname || msg.sender.email || "User"),
        });
      }
    });
    return () => s.disconnect();
  }, [isAuth, isUserChatOpen, activeConversationId]);

  useEffect(() => {
    if (isUserChatOpen) setNotificationPreview(null);
  }, [isUserChatOpen]);

  const onLogin = () => {
    setIsAuth(true);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    setIsAuth(false);
  };

  const handleNotificationClick = (convId) => {
    setIsUserChatOpen(true);
    setActiveConversationId(convId);
    setNotificationPreview(null);
  };

  return (
    <ChakraProvider theme={theme}>
      <ChatContext.Provider value={{
        isUserChatOpen,
        setIsUserChatOpen,
        activeConversationId,
        setActiveConversationId
      }}>
        <Box
          minH={"100vh"}
          position="relative"
          overflowX="auto"
          whiteSpace="nowrap"
        >
          {!hideNavbarRoutes.includes(location.pathname) && (
            <Navbar isAuth={isAuth} onLogout={logout} />
          )}
          <Box maxW="container.xl" mx="auto" px={4}>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/login" element={<LoginPage onLogin={onLogin} />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route
                  path="/auth/cas/callback"
                  element={<CASCallback onLogin={onLogin} />}
                />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute element={<HomePage />} isAuth={isAuth} />
                  }
                />
                <Route
                  path="/create"
                  element={
                    <ProtectedRoute element={<CreatePage />} isAuth={isAuth} />
                  }
                />
                <Route
                  path="/my-cart"
                  element={
                    <ProtectedRoute element={<MyCartPage />} isAuth={isAuth} />
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute element={<ProfilePage />} isAuth={isAuth} />
                  }
                />
                <Route
                  path="/my-items"
                  element={
                    <ProtectedRoute element={<MyItemsPage />} isAuth={isAuth} />
                  }
                />
                <Route
                  path="/item/:id"
                  element={
                    <ProtectedRoute element={<ItemPage />} isAuth={isAuth} />
                  }
                />
                <Route
                  path="/order-history"
                  element={
                    <ProtectedRoute
                      element={<OrderHistoryPage />}
                      isAuth={isAuth}
                    />
                  }
                />
                <Route
                  path="/deliver-items"
                  element={
                    <ProtectedRoute
                      element={<DeliverItemsPage />}
                      isAuth={isAuth}
                    />
                  }
                />
              </Routes>
            </AnimatePresence>
          </Box>

          {/* Floating ChatBot - only show when authenticated */}
          {isAuth && (
            <FloatingChatBot
              socket={socket}
              isUserChatOpen={isUserChatOpen}
              setIsUserChatOpen={setIsUserChatOpen}
              activeConversationId={activeConversationId}
              setActiveConversationId={setActiveConversationId}
            />
          )}

          {/* Custom Notification Preview */}
          {notificationPreview && !isUserChatOpen && (
            <Box
              position="fixed"
              bottom="30px"
              left="30px"
              zIndex={2000}
              bg="white"
              color="black"
              p={4}
              borderRadius="lg"
              boxShadow="xl"
              cursor="pointer"
              minW="250px"
              maxW="350px"
              onClick={() => handleNotificationClick(notificationPreview.conversationId)}
            >
              <strong>{notificationPreview.sender}</strong>
              <Box>{notificationPreview.text}</Box>
            </Box>
          )}
        </Box>
      </ChatContext.Provider>
    </ChakraProvider>
  );
}

export default App;
