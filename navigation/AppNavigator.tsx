import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import RegisterScreen from '../screens/RegisterScreen';
import HistoryScreen from '../screens/HistoryScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.navy }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '700' }, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="Registrar" component={RegisterScreen} options={{ title: 'Ponto Certo' }} />
      <Stack.Screen name="Historico" component={HistoryScreen} options={{ title: 'Registros de ponto' }} />
    </Stack.Navigator>
  </NavigationContainer>;
}
