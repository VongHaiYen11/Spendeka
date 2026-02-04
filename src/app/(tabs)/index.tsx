import { StyleSheet, TouchableOpacity, StatusBar, Modal, TextInput, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import { Text, View, SafeView, useThemeColor } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors, { PRIMARY_COLOR } from '@/constants/Colors';
import { useTransactions } from '@/contexts/TransactionContext';
import { Expense } from '@/models/Expense';
import { ExpenseDetailScreen } from '@/screens/camera';
import { isSameDay } from 'date-fns';

export default function HomeScreen() {
  const router = useRouter();
  const { transactions, reloadTransactions } = useTransactions();
  const [userName] = useState('User'); // TODO: Get from user profile/authentication
  const [textModalVisible, setTextModalVisible] = useState(false);
  const [textInputValue, setTextInputValue] = useState('');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const colorScheme = useColorScheme();
  const iconColor = Colors[colorScheme ?? 'light'].text;
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const todayCardBackground = colorScheme === 'dark' ? '#1a1a1a' : '#ffffff';

  const expenses = useMemo<Expense[]>(() => {
    return transactions
      .map((tx) => ({
        id: tx.id,
        imageUrl: tx.imageUrl ?? '',
        caption: tx.caption,
        amount: tx.amount,
        category: tx.category,
        type: tx.type,
        createdAt: tx.createdAt,
      }))
      .filter(
        (expense) =>
          expense.type !== 'income' &&
          expense.imageUrl &&
          expense.imageUrl.trim() !== '',
      );
  }, [transactions]);

  const todayExpenses = useMemo(() => {
    const now = new Date();
    return expenses.filter((e) => isSameDay(e.createdAt, now));
  }, [expenses]);

  const todayTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter((t) => isSameDay(t.createdAt, now));
  }, [transactions]);

  const totalIncomeToday = useMemo(
    () =>
      todayTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
    [todayTransactions],
  );

  const totalSpentToday = useMemo(
    () =>
      todayTransactions
        .filter((t) => t.type === 'spent' || !t.type)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
    [todayTransactions],
  );

  const formatAmount = (value: number) =>
    value.toLocaleString(undefined, { maximumFractionDigits: 0 });

  const handleDump = () => {
    router.push('/add-transaction' as import('expo-router').Href);
  };

  const handleGoHistory = () => {
    router.push('/history' as import('expo-router').Href);
  };

  const openTextModal = () => setTextModalVisible(true);
  const closeTextModal = () => {
    setTextModalVisible(false);
    setTextInputValue('');
  };

  const handleOpenTodayExpenseDetail = (expense: Expense) => {
    setSelectedExpense(expense);
  };

  const handleCloseExpenseDetail = () => {
    setSelectedExpense(null);
  };

  const handleDeleteExpense = (expenseId: string) => {
    Alert.alert(
      'Delete expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { deleteExpense } = await import('@/services/TransactionService');
              await deleteExpense(expenseId);
              await reloadTransactions();
              setSelectedExpense(null);
            } catch (error) {
              Alert.alert('Error', 'Could not delete expense');
            }
          },
        },
      ],
    );
  };

  if (selectedExpense) {
    return (
      <ExpenseDetailScreen
        expenses={expenses}
        initialExpenseId={selectedExpense.id}
        onClose={handleCloseExpenseDetail}
        onDelete={handleDeleteExpense}
      />
    );
  }

  return (
    <SafeView style={styles.container}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {userName}!</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color={iconColor} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="person-circle-outline" size={24} color={iconColor} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Toolbar */}
      <View style={styles.toolbarContainer}>
        <View 
          style={styles.toolbar}
          lightColor="#ffffff"
          darkColor="rgba(255,255,255,0.1)"
        >
          <TouchableOpacity style={styles.toolbarButton} onPress={handleGoHistory}>
            <Ionicons name="time-outline" size={28} color={iconColor} />
            <Text style={styles.toolbarLabel}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton}>
            <Ionicons name="scan-outline" size={28} color={iconColor} />
            <Text style={styles.toolbarLabel}>Scan bill</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton} onPress={openTextModal}>
            <Ionicons name="text-outline" size={28} color={iconColor} />
            <Text style={styles.toolbarLabel}>Text</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton}>
            <Ionicons name="mic-outline" size={28} color={iconColor} />
            <Text style={styles.toolbarLabel}>Voice</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Today summary card */}
      <View style={styles.todayCardWrapper}>
        <View style={[styles.todayCard, { backgroundColor: todayCardBackground }]}>
          {/* Left: today's latest photos */}
          <TouchableOpacity
            style={styles.todayImagesContainer}
            activeOpacity={todayExpenses.length ? 0.8 : 1}
            disabled={!todayExpenses.length}
            onPress={() => {
              if (todayExpenses.length) {
                handleOpenTodayExpenseDetail(todayExpenses[0]);
              }
            }}
          >
            {todayExpenses.length ? (
              <Image
                source={{ uri: todayExpenses[0].imageUrl }}
                style={styles.todayImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.todayEmptyImage}>
                <Ionicons
                  name="image-outline"
                  size={28}
                  color={colorScheme === 'dark' ? '#777' : '#999'}
                />
                <Text style={[styles.todayEmptyText, { color: textColor }]}>
                  No photos today
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Right: today totals */}
          <View style={styles.todayInfo}>
            <Text style={[styles.todayTitle, { color: textColor }]}>Today</Text>
            <Text style={styles.todayIncomeValue}>
              +{formatAmount(totalIncomeToday)}
            </Text>
            <Text style={styles.todayExpenseValue}>
              -{formatAmount(totalSpentToday)}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Home</Text>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        <TouchableOpacity style={styles.dumpButton} onPress={handleDump}>
          <Text style={[styles.dumpButtonText, { color: iconColor }]}>Dump</Text>
        </TouchableOpacity>
      </View>

      {/* Text to Transaction Modal */}
      <Modal
        visible={textModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeTextModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeTextModal}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboard}
          >
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <View style={[styles.modalContent, { backgroundColor }]}>
                <Text style={[styles.modalHeading, { color: textColor }]}>
                  Text to Transaction
                </Text>
                <Text style={[styles.modalInstruction, { color: textColor }]}>
                  Paste or type your receipt or expense text below. We'll try to turn it into a transaction.
                </Text>
                <TextInput
                  style={[
                    styles.modalInput,
                    { color: textColor, borderColor, backgroundColor: backgroundColor === '#000' ? '#1a1a1a' : '#f5f5f5' },
                  ]}
                  placeholder="e.g. Coffee $4.50, Lunch $12..."
                  placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
                  value={textInputValue}
                  onChangeText={setTextInputValue}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalCancelButton, { borderColor }]}
                    onPress={closeTextModal}
                  >
                    <Text style={[styles.modalCancelText, { color: textColor }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalCreateButton, { backgroundColor: PRIMARY_COLOR }]}
                    onPress={() => {}}
                  >
                    <Text style={styles.modalCreateText}>Create</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 25,
  },
  toolbarContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconButton: {
    padding: 5,
  },
  toolbarButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 10,
  },
  toolbarLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
  },
  todayCardWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  todayCard: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 16,
    height: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  todayImagesContainer: {
    flex: 1,
    marginRight: 12,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayImage: {
    width: '100%',
    height: '100%',
  },
  todayEmptyImage: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayEmptyText: {
    marginTop: 6,
    fontSize: 12,
    opacity: 0.7,
  },
  todayInfo: {
    flex: 1,
    paddingLeft: 8,
    justifyContent: 'center',
  },
  todayTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  todayIncomeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2ecc71',
    marginTop: 4,
  },
  todayExpenseValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e74c3c',
    marginTop: 2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  dumpButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: 'rgba(128,128,128,0.3)',
  },
  dumpButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Text to Transaction modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalKeyboard: {
    width: '100%',
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  modalHeading: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  modalInstruction: {
    fontSize: 14,
    opacity: 0.85,
    marginBottom: 16,
    lineHeight: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 100,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalCreateButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  modalCreateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});
