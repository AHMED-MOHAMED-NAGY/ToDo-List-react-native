/**
 * OmniTask - Navigation Configuration
 * Tab-based navigation with stack navigators per tab
 */
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../theme/ThemeContext';

// Screens (will be implemented in Step 5)
import DashboardScreen from '../features/Tasks/screens/DashboardScreen';
import TaskListScreen from '../features/Tasks/screens/TaskListScreen';
import TaskDetailScreen from '../features/Tasks/screens/TaskDetailScreen';
import CreateTaskScreen from '../features/Tasks/screens/CreateTaskScreen';
import SettingsScreen from '../features/Tasks/screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/**
 * Tasks Stack Navigator
 */
const TasksStack = () => {
  const {colors} = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: colors.surface},
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        contentStyle: {backgroundColor: colors.background},
      }}>
      <Stack.Screen
        name="TaskList"
        component={TaskListScreen}
        options={{title: 'All Tasks'}}
      />
      <Stack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{title: 'Task Details'}}
      />
      <Stack.Screen
        name="CreateTask"
        component={CreateTaskScreen}
        options={{title: 'New Task', presentation: 'modal'}}
      />
    </Stack.Navigator>
  );
};

/**
 * Main Tab Navigator
 */
const AppNavigator = () => {
  const {colors} = useTheme();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({route}) => ({
          tabBarIcon: ({focused, color, size}) => {
            let iconName;
            switch (route.name) {
              case 'Dashboard':
                iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
                break;
              case 'Tasks':
                iconName = focused ? 'checkbox-marked-circle' : 'checkbox-marked-circle-outline';
                break;
              case 'Settings':
                iconName = focused ? 'cog' : 'cog-outline';
                break;
              default:
                iconName = 'circle';
            }
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.tabActive,
          tabBarInactiveTintColor: colors.tabInactive,
          tabBarStyle: {
            backgroundColor: colors.tabBackground,
            borderTopColor: colors.border,
            borderTopWidth: 0.5,
            paddingBottom: 6,
            paddingTop: 6,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          headerShown: false,
        })}>
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{headerShown: true, title: '⚡ OmniTask'}}
        />
        <Tab.Screen name="Tasks" component={TasksStack} />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{headerShown: true, title: 'Settings'}}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
