import React, { useState, useEffect } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet, Dimensions, ActivityIndicator  } from 'react-native';
import { useDispatch } from 'react-redux';
import { loginAsync } from '../../redux/slices/authSlice';
import type { AppDispatch } from '../../redux/store';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('screen');

// Define your stack params
type RootStackParamList = {
  Login: undefined;
  Home: undefined;
};

const LoginScreen = () => {
  const [username, setUsername] = useState('aukhan288@gmail.com');
  const [password, setPassword] = useState('Admin12#');
  const [logoWidth, setLogowidth] = useState(268);
  const [hidePassword, setHidePassword] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();


  const handleLogin = async () => {
     if (loading) return;
     setLoading(true);
     try {
     await dispatch(loginAsync({ username, password })).unwrap();
     }catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
     
     
  }

  // 🚀 Smooth looping animation for the white bar
  useEffect(() => {
    const interval = setInterval(() => {
      setLogowidth(prev => (prev <= 10 ? 268 : prev - 20));
    }, 80);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View
          style={{
            backgroundColor: '#FFF',
            zIndex: 1,
            width: logoWidth,
            height: 50,
            position: 'absolute',
            top: 0,
            right: 0,
          }}
        />
        <Text style={styles.title}>inspections</Text>
      </View>

      {/* Username Input */}
      <TextInput
        editable={!loading}
        placeholder="Email"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {/* Password Input */}
      <View style={styles.passwordContainer}>
        <TextInput
          editable={!loading}
          placeholder="Password"
          value={password} 
          onChangeText={setPassword}
          style={styles.passwordInput}
          secureTextEntry={hidePassword}
        />
        <Pressable onPress={() => setHidePassword(!hidePassword)}>
          <Icon
            name={hidePassword ? 'visibility' : 'visibility-off'}
            size={24}
            color="#103B38"
          />
        </Pressable>
      </View>

      {/* Login Button */}
      <Pressable
        disabled={loading}
        onPress={handleLogin}
       style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: loading
              ? '#9DB9B7'
              : pressed
              ? '#F7B551'
              : '#103B38',
            transform: [{ scale: pressed && !loading ? 0.97 : 1 }],
            opacity: loading ? 0.8 : 1,
          },
        ]}>
        {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
    position: 'relative',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#103B38',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 7,
    marginTop: 8,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default LoginScreen;
