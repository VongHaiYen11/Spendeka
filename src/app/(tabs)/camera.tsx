import { Text } from "@/components/Themed";
import { PRIMARY_COLOR } from "@/constants/Colors";
import { useTransactions } from "@/contexts/TransactionContext";
import { Expense } from "@/models/Expense";
import {
  ExpenseCalendarView,
  ExpenseDetailScreen,
  ExpensePreviewScreen,
} from "@/screens/camera";
import { deleteExpense } from "@/services/TransactionService";
import { DatabaseTransaction } from "@/types/transaction";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Camera, CameraView, FlashMode } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  BackHandler,
  Dimensions,
  View as RNView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const { width } = Dimensions.get("window");
const CAMERA_SIZE = width - 40;

type TabType = "camera" | "history";

// Convert DatabaseTransaction to Expense
const databaseTransactionToExpense = (tx: DatabaseTransaction): Expense => ({
  id: tx.id,
  imageUrl: tx.imageUrl ?? "",
  caption: tx.caption,
  amount: tx.amount,
  category: tx.category,
  type: tx.type,
  createdAt: tx.createdAt,
});

export default function CameraScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ openExpenseId?: string }>();
  const openExpenseId = params.openExpenseId;

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [isCapturing, setIsCapturing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("camera");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const cameraRef = useRef<CameraView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Get transactions from global state
  const { transactions, reloadTransactions } = useTransactions();

  // Convert to Expense format: only spent (expense) with valid image URLs; hide income in camera screen
  const expenses = useMemo(() => {
    return transactions
      .map(databaseTransactionToExpense)
      .filter(
        (expense) =>
          expense.type !== "income" &&
          expense.imageUrl &&
          expense.imageUrl.trim() !== "",
      );
  }, [transactions]);

  // Sync selectedExpense from openExpenseId (when opening detail from Home)
  useEffect(() => {
    if (openExpenseId && expenses.length > 0) {
      const found = expenses.find((e) => e.id === openExpenseId);
      if (found) setSelectedExpense(found);
    } else if (!openExpenseId) {
      setSelectedExpense(null);
    }
  }, [openExpenseId, expenses]);

  // Always default to the camera tab when screen gains focus
  useFocusEffect(
    useCallback(() => {
      setActiveTab("camera");
    }, []),
  );

  // Handle hardware back / back gesture to navigate within camera/expense/detail states
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (selectedExpense) {
          router.setParams({ openExpenseId: "" });
          setSelectedExpense(null);
          return true;
        }

        if (capturedImage) {
          // From preview -> back to camera
          setCapturedImage(null);
          return true;
        }

        if (activeTab === "history") {
          // From expenses tab -> back to camera tab
          setActiveTab("camera");
          return true;
        }

        // Let navigator handle (go back to home / previous screen)
        return false;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => {
        subscription.remove();
      };
    }, [selectedExpense, capturedImage, activeTab]),
  );

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const startPulse = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const takePicture = async () => {
    if (cameraRef.current && !isCapturing) {
      setIsCapturing(true);
      startPulse();
      try {
        const photo = await cameraRef.current.takePictureAsync({
          shutterSound: false,
        });
        if (photo?.uri) {
          setCapturedImage(photo.uri);
        }
      } catch (error) {
        Alert.alert("Error", "Could not take photo");
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const handlePreviewSaveSuccess = async () => {
    setCapturedImage(null);
    // Reload transactions from database to get the latest data
    await reloadTransactions();
  };

  const handlePreviewCancel = () => {
    setCapturedImage(null);
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const toggleFlash = () => {
    setFlash((current) => (current === "off" ? "on" : "off"));
  };

  const handleCloseExpenseDetail = () => {
    router.setParams({ openExpenseId: "" });
    setSelectedExpense(null);
  };

  const handleDeleteExpense = (expenseId: string) => {
    Alert.alert(
      "Delete expense",
      "Are you sure you want to delete this expense?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteExpense(expenseId);
              await reloadTransactions();
              router.setParams({ openExpenseId: "" });
              setSelectedExpense(null);
            } catch (error) {
              Alert.alert("Error", "Could not delete expense");
            }
          },
        },
      ],
    );
  };

  // Loading permission
  if (hasPermission === null) {
    return (
      <RNView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </RNView>
    );
  }

  // No permission
  if (hasPermission === false) {
    return (
      <RNView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <Ionicons name="camera-outline" size={64} color="#999" />
        <Text style={styles.loadingText}>No camera access</Text>
        <Text style={styles.subText}>Please grant permission in settings</Text>
      </RNView>
    );
  }

  // Viewing existing expense detail (from Camera tab or from Home via openExpenseId)
  if (selectedExpense) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#000" translucent={false} />
        <ExpenseDetailScreen
          expenses={expenses}
          initialExpenseId={selectedExpense.id}
          onClose={handleCloseExpenseDetail}
          onDelete={handleDeleteExpense}
        />
      </>
    );
  }

  // Preview Screen
  if (capturedImage) {
    return (
      <ExpensePreviewScreen
        imageUri={capturedImage}
        onSaveSuccess={handlePreviewSaveSuccess}
        onCancel={handlePreviewCancel}
      />
    );
  }

  // Main Camera Screen - Always dark mode
  return (
    <RNView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header with Tabs */}
      <RNView style={styles.header}>
        <RNView style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "camera" && styles.activeTab]}
            onPress={() => setActiveTab("camera")}
          >
            <Ionicons
              name="camera"
              size={20}
              color={activeTab === "camera" ? PRIMARY_COLOR : "#999"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "camera" && styles.activeTabText,
              ]}
            >
              Camera
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "history" && styles.activeTab]}
            onPress={() => setActiveTab("history")}
          >
            <Ionicons
              name="receipt"
              size={20}
              color={activeTab === "history" ? PRIMARY_COLOR : "#999"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "history" && styles.activeTabText,
              ]}
            >
              Expenses
            </Text>
          </TouchableOpacity>
        </RNView>
      </RNView>

      {/* Content */}
      {activeTab === "camera" ? (
        <RNView style={styles.cameraPage}>
          <RNView style={styles.cameraWrapper}>
            <RNView style={styles.cameraContainer}>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
                flash={flash}
              />
            </RNView>
          </RNView>

          <RNView style={styles.controls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleFlash}
            >
              <Ionicons
                name={flash === "on" ? "flash" : "flash-off"}
                size={24}
                color={flash === "on" ? PRIMARY_COLOR : "#fff"}
              />
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
                disabled={isCapturing}
                activeOpacity={0.8}
              >
                <RNView style={styles.captureButtonInner}>
                  {isCapturing && (
                    <ActivityIndicator
                      size="small"
                      color="#000"
                      style={styles.captureLoader}
                    />
                  )}
                </RNView>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleCameraFacing}
            >
              <Ionicons name="camera-reverse-outline" size={28} color="#fff" />
            </TouchableOpacity>
          </RNView>
        </RNView>
      ) : (
        <RNView style={styles.historyPage}>
          <ExpenseCalendarView
            expenses={expenses}
            onSelectExpense={setSelectedExpense}
          />
        </RNView>
      )}
    </RNView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 16,
  },
  subText: {
    color: "#999",
    fontSize: 14,
    marginTop: 8,
  },

  // Header with Tabs
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 22,
    gap: 8,
  },
  activeTab: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  tabText: {
    color: "#999",
    fontSize: 14,
    fontWeight: "600",
  },
  activeTabText: {
    color: PRIMARY_COLOR,
  },

  // Camera Page
  cameraPage: {
    flex: 1,
    justifyContent: "flex-start",
    paddingBottom: 24,
  },
  cameraWrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  cameraContainer: {
    width: CAMERA_SIZE,
    height: CAMERA_SIZE,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  camera: {
    width: "100%",
    height: "100%",
  },

  // Controls
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
    marginTop: 60,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: PRIMARY_COLOR,
    borderWidth: 4,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  captureLoader: {
    position: "absolute",
  },

  // History Page - Calendar View
  historyPage: {
    flex: 1,
  },
});
