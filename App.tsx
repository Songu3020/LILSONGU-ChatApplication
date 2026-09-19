import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./src/services/firebase";
import {
  createUserIfNotExists,
  setUserOnlineStatus,
} from "./src/services/users";
import ChatListScreen from "./src/screens/ChatListScreen";
import ChatRoomScreen from "./src/screens/ChatRoomScreen";
import LoginScreen from "./src/screens/LoginScreen";
import NewChatScreen from "./src/screens/NewChatScreen";

export type RootStackParamList = {
  Login: undefined;
  ChatList: undefined;
  ChatRoom: { contactId: string; contactName: string };
  NewChat: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const screenOptions = {
  headerStyle: { backgroundColor: "#121212" },
  headerTintColor: "#fff",
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);

      if (user) {
        async function initializeUser() {
          await createUserIfNotExists(user!.uid, user!.phoneNumber || "");
          await setUserOnlineStatus(user!.uid, true);
        }
        initializeUser();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    function handleBeforeUnload() {
      const userId = auth.currentUser?.uid;
      if (userId) {
        setUserOnlineStatus(userId, false);
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  if (isLoggedIn === null) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isLoggedIn ? (
          <>
            <Stack.Screen
              name="ChatList"
              component={ChatListScreen}
              options={{ ...screenOptions, title: "Chats" }}
            />
            <Stack.Screen
              name="ChatRoom"
              component={ChatRoomScreen}
              options={{ ...screenOptions, title: "Chat" }}
            />
            <Stack.Screen
              name="NewChat"
              component={NewChatScreen}
              options={{ ...screenOptions, title: "New Chat" }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ ...screenOptions, title: "Login" }}
          />
        )}
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
